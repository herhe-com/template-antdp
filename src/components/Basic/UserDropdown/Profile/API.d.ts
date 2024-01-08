declare namespace COMBasicProfile {

  type Props = {
    open?: boolean;
    onClose?: () => void;
  }

  type Editor = {
    mobile?: string;
    email?: string;
    password?: string;
  };

  type Former = {
    nickname?: string;
    username?: string;
    email?: string;
    mobile?: string;
    password?: string;
  };

}
