class CContactId {
  server?: string;
  user?: string;
  _serialized?: string;
}
export class CContact {
  id: CContactId = new CContactId();
  number?: string;
  isBusiness?: boolean;
  name?: string;
  pushname?: string;
  shortName?: string;
  type?: string;
  isMe?: boolean;
  isUser?: boolean;
  isGroup?: boolean;
  isWAContact?: boolean;
  isMyContact?: boolean;
  isBlocked?: boolean;
  profilePicUrl?: string;

  static fromContact(contact: any): CContact {
    const cContact = new CContact();
    cContact.id.server = contact.id.server;
    cContact.id.user = contact.id.user;
    cContact.id._serialized = contact.id._serialized;

    cContact.number = contact.number;
    cContact.isBusiness = contact.isBusiness;
    cContact.name = contact.name;
    cContact.pushname = contact.pushname;
    cContact.shortName = contact.shortName;
    cContact.type = contact.type;
    cContact.isMe = contact.isMe;
    cContact.isUser = contact.isUser;
    cContact.isGroup = contact.isGroup;
    cContact.isWAContact = contact.isWAContact;
    cContact.isMyContact = contact.isMyContact;
    cContact.isBlocked = contact.isBlocked;
    cContact.profilePicUrl = contact.profilePicUrl;
    return cContact;
  }
}
