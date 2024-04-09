/* eslint-disable quotes */
/* eslint-disable indent */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
    PublicKey,
    SystemProgram,
    LAMPORTS_PER_SOL,
    Connection,
    clusterApiUrl
    
} from "@solana/web3.js";
import "dotenv/config";
import { getKeypairFromEnvironment } from "@solana-developers/helpers";
import("@solana/spl-token");
import Squads, { Wallet } from '@sqds/sdk';
import axios from "axios";

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

describe("GET SOL USD", () => {

    it("SOL IN USD", async () => {

        const response = (await axios.get("https://api.binance.com/api/v3/ticker/price?symbol=SOLUSDT")).data;
 
        console.log(response.price);
       
    });


  
});