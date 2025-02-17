import { TestBed } from '@angular/core/testing';
import { WhatsAppService } from './whats-app.service';
import { SendFilesService } from './send-files.service';
import { DialogService } from './dialog.service';
import { CFile } from '../models/cfile';
import { CContact } from '../models/ccontact';
import { firstValueFrom, Subscription, Observable } from 'rxjs';

describe('WhatsAppService', () => {
  let service: WhatsAppService;
  let mockSendFilesService: jasmine.SpyObj<SendFilesService>;
  let mockDialogService: jasmine.SpyObj<DialogService>;
  let mockElectron: any;
  let subscriptions: Subscription[] = [];

  const mockFiles: CFile[] = [
    new CFile('/path/test1.txt', 'test1.txt', false, 1000),
    new CFile('/path/test2.txt', 'test2.txt', false, 2000)
  ];

  const mockContacts = [
    {
      id: { server: 'server1', user: 'user1', _serialized: 'serial1' },
      number: '1234567890',
      name: 'Contact1'
    },
    {
      id: { server: 'server2', user: 'user2', _serialized: 'serial2' },
      number: '0987654321',
      name: 'Contact2'
    }
  ];

  const mockCContacts = mockContacts.map(contact => CContact.fromContact(contact));

  beforeEach(() => {
    subscriptions = [];

    mockSendFilesService = jasmine.createSpyObj('SendFilesService', [], {
      filesToSend: []
    });

    mockDialogService = jasmine.createSpyObj('DialogService', [
      'showWhatsAppContactListDialog',
      'isWhatsAppContactListDialogVisible'
    ]);

    mockElectron = {
      receive: jasmine.createSpy('receive'),
      getWhatsAppContactList: jasmine.createSpy('getWhatsAppContactList')
        .and.returnValue(Promise.resolve(mockContacts))
    };

    spyOn(localStorage, 'getItem');
    spyOn(localStorage, 'setItem');
    spyOn(localStorage, 'removeItem');

    TestBed.configureTestingModule({
      providers: [
        WhatsAppService,
        { provide: SendFilesService, useValue: mockSendFilesService },
        { provide: DialogService, useValue: mockDialogService }
      ]
    });

    (window as any).electron = mockElectron;
    service = TestBed.inject(WhatsAppService);
  });

  afterEach(() => {
    subscriptions.forEach(sub => sub.unsubscribe());
    subscriptions = [];
    delete (window as any).electron;
  });

  function subscribe(observable: Observable<any>, callback: (value: any) => void): void {
    subscriptions.push(observable.subscribe(callback));
  }

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('WhatsApp Authentication', () => {
    it('should handle authentication event', () => {
      const callback = mockElectron.receive.calls.argsFor(0)[1];
      callback();
      expect(service.isAuthenticated).toBeTrue();
    });

    it('should handle logout event', () => {
      const callback = mockElectron.receive.calls.argsFor(1)[1];
      callback();
      expect(localStorage.removeItem)
        .toHaveBeenCalledWith(service['CCONTACTS_LOCAL_STORAGE_RECORD']);
    });
  });

  describe('Send via WhatsApp', () => {
    beforeEach(() => {
      mockDialogService.isWhatsAppContactListDialogVisible.and.returnValue(false);
    });

    it('should fetch and store contacts', async () => {
      await service.sendViaWhatsApp(mockFiles);
      const contacts = await firstValueFrom(service.ccontacts$);
      expect(contacts).toEqual(mockCContacts);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        service['CCONTACTS_LOCAL_STORAGE_RECORD'],
        JSON.stringify(mockCContacts)
      );
    });

    it('should show contact list dialog if not visible', async () => {
      await service.sendViaWhatsApp(mockFiles);
      expect(mockDialogService.showWhatsAppContactListDialog).toHaveBeenCalled();
    });

    it('should not show dialog if already visible', async () => {
      mockDialogService.isWhatsAppContactListDialogVisible.and.returnValue(true);
      await service.sendViaWhatsApp(mockFiles);
      expect(mockDialogService.showWhatsAppContactListDialog).not.toHaveBeenCalled();
    });

    it('should set loading state to false after fetching contacts', async () => {
      await service.sendViaWhatsApp(mockFiles);
      const isLoading = await firstValueFrom(service.isWhatsAppLoading$);
      expect(isLoading).toBeFalse();
    });
  });

  describe('Cached Contacts', () => {
    it('should load cached contacts if authenticated', async () => {
      (localStorage.getItem as jasmine.Spy).and.returnValue(JSON.stringify(mockContacts));
      service.isAuthenticated = true;

      service.sendViaWhatsApp(mockFiles);
      const contacts = await firstValueFrom(service.ccontacts$);

      expect(contacts).toEqual(mockCContacts);
      expect(mockDialogService.showWhatsAppContactListDialog).toHaveBeenCalled();
    });

    it('should not load cached contacts if not authenticated', () => {
      (localStorage.getItem as jasmine.Spy).and.returnValue(JSON.stringify(mockContacts));
      service.isAuthenticated = false;

      service.sendViaWhatsApp(mockFiles);
      expect(mockDialogService.showWhatsAppContactListDialog).not.toHaveBeenCalled();
    });

    it('should handle empty cached contacts', () => {
      (localStorage.getItem as jasmine.Spy).and.returnValue('');
      service.isAuthenticated = true;

      service.sendViaWhatsApp(mockFiles);
      expect(mockDialogService.showWhatsAppContactListDialog).not.toHaveBeenCalled();
    });

    it('should handle null cached contacts', () => {
      (localStorage.getItem as jasmine.Spy).and.returnValue(null);
      service.isAuthenticated = true;

      service.sendViaWhatsApp(mockFiles);
      expect(mockDialogService.showWhatsAppContactListDialog).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle contact list fetch error', async () => {
      mockElectron.getWhatsAppContactList
        .and.returnValue(Promise.reject(new Error('Failed to fetch')));

      await service.sendViaWhatsApp(mockFiles);
      const isLoading = await firstValueFrom(service.isWhatsAppLoading$);
      expect(isLoading).toBeTrue();
    });
  });

  describe('Initial State', () => {
    it('should initialize with empty contacts', async () => {
      const contacts = await firstValueFrom(service.ccontacts$);
      expect(contacts).toEqual([]);
    });

    it('should initialize with loading state false', async () => {
      const isLoading = await firstValueFrom(service.isWhatsAppLoading$);
      expect(isLoading).toBeFalse();
    });

    it('should initialize with not authenticated state', () => {
      expect(service.isAuthenticated).toBeFalse();
    });
  });
});
