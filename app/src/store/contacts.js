import { PermissionsAndroid } from 'react-native';
import Contacts from 'react-native-contacts';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import _ from 'hibar';

export const normalizePhone = (phone) =>
  parsePhoneNumberFromString(phone).number;

const contactFullName = (contact) =>
  [contact.givenName, contact.middleName, contact.familyName]
    .filter((e) => e)
    .join(' ');

const getAllContacts = _.promisify(Contacts.getAll);

export const getContacts = () =>
  PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_CONTACTS).then(
    (enabled) => {
      if (!enabled) {
        console.warn('Contacts permission not enabled.');
        return false;
      }

      return getAllContacts().catch((err) => {
        console.error(err);
        return [];
      });
    }
  );

const getContactsByPhone = (contacts) =>
  contacts.reduce((memo, contact) => {
    const { recordID, givenName, middleName, familyName } = contact;
    const contactData = { id: recordID, givenName, middleName, familyName };

    contacts.phoneNumbers.forEach((phoneNumber) => {
      const { id, label, number } = phoneNumber;
      memo[normalizePhone(number)] = contactData;
    });

    return memo;
  }, {});

export const getDisplayNames = (chats, contacts) => {
  const contactsByPhone = getContactsByPhone(contacts);

  return chats.map((chat) => {
    const { handles } = chat;
    const phones = handles.map((e) => normalizePhone(e.guid));

    const display_name = phones
      .map((phone) => {
        const contact = contactsByPhone[phone];

        return contact
          ? phones.length > 1
            ? contact.givenName
            : contactFullName(contact)
          : phone;
      })
      .join(', ');

    return { id: chat.id, display_name };
  });
};
