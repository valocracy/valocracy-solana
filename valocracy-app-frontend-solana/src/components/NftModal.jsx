/* eslint-disable no-unused-vars */
/* eslint-disable quotes */
import { Buffer } from "buffer";
window.Buffer = Buffer;
import {
  Connection,
  clusterApiUrl,
  PublicKey,
  Transaction,
} from "@solana/web3.js";
import * as splToken from "@solana/spl-token";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  Box,
  Center,
  useColorModeValue,
  Heading,
  Text,
  Stack,
  HStack,
  Image,
  Badge,
  Button,
  ModalCloseButton,
} from "@chakra-ui/react";
import { claimEffort } from "../api/economy";
import { convertToBrazilianDateFormat } from "../helpers/utils";
import { FiExternalLink } from "react-icons/fi";
import { useLoading } from "../hooks/useLoading";
import { useWallet } from "../hooks/useWallet";

function NftModal({ isOpen, onClose, nft }) {
  if (!nft) {
    return;
  }
  console.log("NFT details: ", nft);
  const { showBackdrop, hideBackdrop } = useLoading();
  const { getPhantomProvider } = useWallet();
  //ESSA AQUI É O ENDEREÇO DA NFT
  const MINT_NFT_ADDRESS = new PublicKey(
    nft?.mint_transaction_hash_governance || ""
  );
  console.log("NFT ADDRESS: ", MINT_NFT_ADDRESS);

  const TOKEN_2022_PROGRAM_ID = new PublicKey(
    "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
  );
  const MINT_DECIMALS = 0;

  const queima = async () => {
    // const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

    // Certifique-se de que a Phantom está instalada
    if (window.solana && window.solana.isPhantom) {
      console.log("Phantom wallet found!");
    } else {
      alert("Phantom wallet not found! Please install it.");
      return;
    }

    try {
      // console.log(`Step 1 - Fetch Token Account`);
      // const wallet = window.solana;
      // const OWNER_NFT_ADDRESS = new PublicKey(wallet.publicKey);
      // const account = await splToken.getAssociatedTokenAddress(
      //   MINT_NFT_ADDRESS,
      //   OWNER_NFT_ADDRESS,
      //   false,
      //   TOKEN_2022_PROGRAM_ID
      // );
      // console.log(
      //   `    ✅ - Associated Token Account Address: ${account.toString()}`
      // );

      // console.log(`\n\nStep 2 - Create Burn Instructions`);
      // const burnIx = splToken.createBurnCheckedInstruction(
      //   account, // PublicKey of Owner's Associated Token Account
      //   MINT_NFT_ADDRESS, // Public Key of the Token Mint Address
      //   OWNER_NFT_ADDRESS, // Public Key of Owner's Wallet
      //   1, // Number of tokens to burn
      //   MINT_DECIMALS, // Number of Decimals of the Token Mint
      //   [],
      //   TOKEN_2022_PROGRAM_ID
      // );
      // console.log(`    ✅ - Burn Instruction Created`);

      // const transaction = new Transaction().add(burnIx);
      // transaction.feePayer = wallet.publicKey;

      // console.log(`\n\nStep 3 - Fetch Blockhash`);
      // const { blockhash } = await connection.getLatestBlockhash();
      // transaction.recentBlockhash = blockhash;
      // console.log(`    ✅ - Latest Blockhash: ${blockhash}`);

      // console.log(`\n\nStep 4 - Requesting Signature`);
      // const signedTransaction = await wallet.signAndSendTransaction(
      //   transaction
      // );
      // console.log(`    ✅ - Transaction Signed`);

      onClose();
      showBackdrop();

      // console.log(`Step 5 - Execute & Confirm Transaction`);
      // const txid = signedTransaction.signature;
      // console.log(`    ✅ - Transaction sent to network: ${txid}`);

      // const confirmation = await connection.confirmTransaction(
      //   txid,
      //   "finalized"
      // );
      // if (confirmation.value.err) {
      //   throw new Error("    ❌ - Transaction not confirmed.");
      // }
      // console.log(
      //   "🔥 SUCCESSFUL BURN!🔥",
      //   "\n",
      //   `https://explorer.solana.com/tx/${txid}?cluster=devnet`
      // );
      const response = await claimEffort(nft.id);
      console.log("claimEffort", { response });

      hideBackdrop();
      window.location.reload();
    } catch (error) {
      console.error("Error burning token:", error);
    }
  };

  const claim = async (effort_id) => {
    onClose();
    showBackdrop();

    const response = await claimEffort(effort_id);
    console.log("claimEffort", { response });

    hideBackdrop();
    window.location.reload();
  };

  return (
    <>
      {nft && (
        <Modal
          sx={{ borderRadius: "4px 4px 0 0" }}
          isOpen={isOpen}
          onClose={onClose}
          closeOnOverlayClick={false}
        >
          <ModalOverlay />
          <ModalContent>
            <Center py={0}>
              <Box
                sx={{ borderRadius: "4px 4px 0 0" }}
                role={"group"}
                p={15}
                w={"full"}
                h={"full"}
                // eslint-disable-next-line react-hooks/rules-of-hooks
                bg={useColorModeValue("gray.800", "gray.800")}
                boxShadow={"2xl"}
                rounded={"lg"}
                pos={"relative"}
                zIndex={1}
                _groupHover={{
                  scale: 1.5,
                }}
              >
                <ModalCloseButton zIndex={10000} />
                <Box
                  rounded={"lg"}
                  pos={"relative"}
                  height={"full"}
                  _after={{
                    transition: "all .3s ease",
                    content: '""',
                    w: "full",
                    h: "full",
                    pos: "absolute",
                    top: 5,
                    left: 0,
                    backgroundImage: `url(${nft.image})`,
                    filter: "blur(15px)",
                    zIndex: -1,
                  }}
                  _groupHover={{
                    _after: {
                      filter: "blur(20px)",
                    },
                  }}
                >
                  <Image
                    rounded={"lg"}
                    height={"300px"}
                    width={"full"}
                    objectFit={"contain"}
                    src={nft.image}
                    alt="#"
                    _groupHover={{
                      scale: 1.5,
                    }}
                  />
                </Box>
                <Box width="full" display={"flex"} justifyContent={"center"}>
                  <HStack>
                    {nft.is_claimed ? (
                      <Badge
                        bg={"red"}
                        rounded={"full"}
                        variant={"solid"}
                        px={2}
                        py={1}
                        mt={4}
                        fontSize={"sm"}
                        textTransform={"uppercase"}
                      >
                        Claimed
                      </Badge>
                    ) : (
                      <></>
                    )}
                    <Badge
                      rounded={"full"}
                      px={2}
                      py={1}
                      mt={4}
                      variant={"solid"}
                      bg={"#29a663"}
                      fontSize={"sm"}
                      textTransform={"uppercase"}
                    >
                      {nft.rarity_name}
                    </Badge>
                  </HStack>
                </Box>
                <br></br>
                <Stack pt={0} align={"center"}>
                  <Heading
                    color={"gray.100"}
                    fontSize={"2xl"}
                    fontFamily={"body"}
                    fontWeight={500}
                  >
                    {nft.title}
                  </Heading>
                </Stack>
                <HStack
                  sx={{
                    padding: "18px 0",
                  }}
                  justifyContent="flex-end"
                >
                  {nft.is_claimed && (
                    <Badge
                      sx={{
                        padding: "2px 0",
                      }}
                      rounded={"full"}
                      // variant={"solid"}
                      fontSize={"sm"}
                      textTransform={"uppercase"}
                      width="100%"
                    >
                      <Stack
                        direction="row"
                        width="100%"
                        as="a"
                        href={`https://solana.fm/tx/${nft.claim_transaction_hash}?cluster=devnet-solana`}
                        target="_blank"
                        justifyContent="center"
                        alignItems="center"
                      >
                        <FiExternalLink />
                        <Text>CLAIM</Text>
                      </Stack>
                    </Badge>
                  )}
                  <Badge
                    sx={{
                      padding: "2px 0",
                    }}
                    rounded={"full"}
                    fontSize={"sm"}
                    textTransform={"uppercase"}
                    width="100%"
                  >
                    <Stack
                      direction="row"
                      width="100%"
                      as="a"
                      href={`https://solana.fm/address/${nft.mint_transaction_hash_governance}?cluster=devnet-solana`}
                      target="_blank"
                      justifyContent="center"
                      alignItems="center"
                    >
                      <FiExternalLink />
                      <Text>MINT (GOV)</Text>
                    </Stack>
                  </Badge>
                  <Badge
                    sx={{
                      padding: "2px 0",
                    }}
                    rounded={"full"}
                    fontSize={"sm"}
                    textTransform={"uppercase"}
                    width="100%"
                  >
                    <Stack
                      direction="row"
                      width="100%"
                      as="a"
                      href={`https://xray.helius.xyz/token/${nft.mint_transaction_hash_economy}?network=devnet`}
                      target="_blank"
                      justifyContent="center"
                      alignItems="center"
                    >
                      <FiExternalLink />
                      <Text>MINT (ECO)</Text>
                    </Stack>
                  </Badge>
                </HStack>
                <Box>
                  <Stack direction="row" alignItems="center">
                    <Text color={"gray.100"} fontWeight={800} fontSize={"xl"}>
                      Economy:
                    </Text>
                    <Text color={"gray.500"}>
                      {nft.economy.power} (${nft.economy.share.toFixed(2)})
                    </Text>
                  </Stack>

                  <Stack direction="row" alignItems="center">
                    <Text color={"gray.100"} fontWeight={800} fontSize={"xl"}>
                      Governance:
                    </Text>
                    <Text color={"gray.500"}>
                      {nft.governance.power} ({nft.governance.relative_power}%)
                    </Text>
                  </Stack>

                  {nft.is_claimed ? (
                    <Stack>
                      <div>
                        <Text
                          color={"gray.100"}
                          fontWeight={800}
                          fontSize={"xl"}
                        >
                          Claim
                        </Text>
                        <Text color={"gray.500"}>
                          Date: {convertToBrazilianDateFormat(nft.claim_date)}
                        </Text>
                        <Text color={"gray.500"}>
                          Claimed value: {nft.claimed_balance}
                        </Text>
                      </div>
                    </Stack>
                  ) : (
                    <></>
                  )}
                </Box>
              </Box>
            </Center>
            {!nft.is_claimed && (
              <Button
                sx={{ borderRadius: "0px 0px 4px 4px" }}
                onClick={() => queima(nft.id)}
                isDisabled={nft.is_claimed}
              >
                Claim
              </Button>
            )}
          </ModalContent>
        </Modal>
      )}
    </>
  );
}

export default NftModal;
