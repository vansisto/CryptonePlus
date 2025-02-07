class CContactId {
  server: string | undefined;
  user: string | undefined;
  _serialized: string | undefined;
}
export class CContact {
  id: CContactId = new CContactId();
  number: string | undefined;
  isBusiness: boolean | undefined;
  name: string | undefined;
  pushname: string | undefined;
  shortName: string | undefined;
  type: string | undefined;
  isMe: boolean | undefined;
  isUser: boolean | undefined;
  isGroup: boolean | undefined;
  isWAContact: boolean | undefined;
  isMyContact: boolean | undefined;
  isBlocked: boolean | undefined;
  profilePicUrl: string | undefined;

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
