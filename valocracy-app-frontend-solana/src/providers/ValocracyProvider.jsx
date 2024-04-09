import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useWallet } from "../hooks/useWallet";
import ValocracyContext from "../contexts/ValocracyContext";
import economyApi from "../api/economy";
import governanceApi from "../api/governance";
import effortApi from "../api/effort";
import { useAuth } from "../hooks/useAuth";

export const ValocracyProvider = ({ children }) => {
  const { walletAccount } = useWallet();
  const [userEconomyInfo, setUserEconomyInfo] = useState(null);
  const [userGovernanceInfo, setGovernanceInfo] = useState(null);
  const [nftsInfo, setNftsInfos] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const syncInfos = async () => {
    try {
      if (walletAccount.length > 0) {
        const economyShare = await economyApi.fetchMyShare();
        const governanceShare = await governanceApi.fetchMyShare();

        setUserEconomyInfo(economyShare);
        setGovernanceInfo(governanceShare);
      } else {
        setUserEconomyInfo(null);
        setGovernanceInfo(null);
      }
    } catch (err) {
      toast.error("Erro ao sincronizar dados da valocracia");
    }
  };

  const syncNFTs = async () => {
    setLoading(true);
    try {
      if (walletAccount.length > 0 && user?.id) {
        const nftsInfo = await effortApi.getNfts(user.id);
        setNftsInfos(nftsInfo);
      } else {
        setNftsInfos([]);
      }
    } catch (error) {
      console.error("Error catch", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      console.log("walletAccount", walletAccount);
      if (walletAccount && user?.id) {
        syncInfos();
        syncNFTs();
      }
    })();
  }, [walletAccount, user]);

  return (
    <ValocracyContext.Provider
      value={{
        userEconomyInfo,
        userGovernanceInfo,
        nftsInfo,
        loading,
      }}
    >
      {children}
    </ValocracyContext.Provider>
  );
};
