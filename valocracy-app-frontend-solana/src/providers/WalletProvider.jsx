import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

//context
import WalletContext from "../contexts/WalletContext";
import metamaskApi from "../api/metamask";
import { useAuth } from "../hooks/useAuth";

export const WalletProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [walletAccount, setWalletAccount] = useState("");
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);
  const { user, isAuthenticated, updateUserInfo } = useAuth();

  const __validateAndSetWallet = async (accounts) => {
    const walletInfo = await metamaskApi.walletRegistryInfo(accounts[0]);

    console.log(walletInfo);
    console.log(user);

    if (
      (!walletInfo.is_owner && !walletInfo.wallet_exist) ||
      walletInfo.is_owner
    ) {
      const connectedAcc = _setAccounts(accounts);
      const userWalletExist = Boolean(user?.id) && Boolean(user?.metamask);

      if (!userWalletExist && connectedAcc.length > 0) {
        await metamaskApi.create(connectedAcc);
        updateUserInfo();
      }
    } else {
      _setAccounts([]);
      throw "Wallet already cadastred in another account";
    }
  };

  const getProvider = () => {
    if ("phantom" in window) {
      const provider = window.phantom?.solana;

      if (provider?.isPhantom) {
        return provider;
      }
    }

    window.open("https://phantom.app/", "_blank");
  };

  const getPhantomProvider = () => {
    if ("phantom" in window) {
      const provider = window.phantom?.solana;

      if (provider?.isPhantom) {
        return provider;
      }
    }

    return false;
  };

  useEffect(() => {
    if (isAuthenticated) connect();
    const { solana } = window;

    if (solana && solana.isPhantom) {
      setIsMetaMaskInstalled(true);

      const provider = getProvider();
      console.log("PROVIDER : ", provider);
      provider.signTransaction().catch(console.log);

      provider.on("accountChanged", (publicKey) => {
        console.log("USER INFO", user);
        if (!publicKey) {
          _setAccounts([]);
        }
        console.log("CHAVE PUBLICA: ", publicKey.toBase58());
        if (user?.metamask && user.metamask.address !== publicKey.toBase58()) {
          console.log("Pegou");
          toast.error("Only One Wallet Connected Allowed");
          __validateAndSetWallet([user.metamask.address]);
        } else {
          if (publicKey) {
            // Set new public key and continue as usual
            console.log(`Switched to account ${publicKey.toBase58()}`);
            __validateAndSetWallet([]);
          } else {
            // Attempt to reconnect to Phantom
            provider
              .connect()
              .then((x) => {
                console.log("New Public Key", x.publicKey.toBase58());
                __validateAndSetWallet([]);
              })
              .catch((error) => {
                console.log(error);
                // Handle connection failure
              });
          }
        }
      });
    }
  }, [isAuthenticated]);

  const _setAccounts = (accounts) => {
    if (accounts.length > 0) {
      setAccounts(accounts);
      setWalletAccount(accounts[0]);
      setIsConnected(true);

      return accounts[0];
    } else {
      setAccounts([]);
      setWalletAccount("");
      setIsConnected(false);

      return "";
    }
  };

  // Function to connect to Solana
  const connect = async () => {
    const { solana } = window;

    if (solana) {
      try {
        // await checkNetwork();
        const response = await solana.connect();
        const accounts = [response.publicKey.toString()];

        console.log({ accounts });
        await __validateAndSetWallet(accounts);
      } catch (err) {
        console.error("Error connecting to Solana:", err);
        return "";
      }
    }
    return "";
  };

  return (
    <WalletContext.Provider
      value={{
        accounts,
        connect,
        isMetaMaskInstalled,
        isConnected,
        walletAccount,
        getPhantomProvider,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
