export type PhoneNumber = {
  countryCode: string;
  number: string;
};

export type PartialContact = {
  user: string;
  saveAsName: string;
};

export type Contact = {
  user: User;
  saveAsName: string;
};

export type ConnectedUser = {
  userId: string;
  socketId: string;
};

export type BannerData = {
  name: string;
  profilePicUrl: string;
  messagesWith: string;
  inContacts: boolean;
  phoneNumber: PhoneNumber;
  selfBlocked: boolean;
  isBlocked: boolean;
};

export type Message = {
  _id: string;
  message?: string;
  sender: string;
  image?: string;
  receiver: string;
  date: Date;
};

export type CallType = {
  sender: string;
  recipient: string;
  profilePicUrl: string;
  recipientProfilePicUrl: string;
  recipientName: string;
  name: string;
  peerId: string;
};

export type ServerError = {
  message: string;
};

export type User = {
  _id: string;
  phoneNumber: PhoneNumber;
  activated: boolean;
  name: string;
  profilePicUrl: string;
  status: string;
  blockedUsers: { user: string }[];
  contacts: PartialContact[];
};

export type Conversation = {
  messagesWith: string;
  name: string;
  profilePicUrl: string;
  lastMessage: string;
  date: Date;
};

// Response types
export type RequestOtpResponse = {
  status: string;
  hash: string;
  otp: string;
};

export type VerifyOtpResponse = {
  status: string;
  message: string;
  auth: boolean;
};

export type UpdateProfileResponse = {
  status: string;
  message: string;
};

// Request types
export type VerifyOtpPayload = {
  otp: string;
  hash: string;
  countryCode: string;
  number: string;
};

export type UpdateProfilePayload = {
  name: string;
  profilePicUrl?: string;
  status?: string;
};

export type AddContactPayload = {
  phoneNumber: PhoneNumber;
  saveAsName?: string;
};
