import { TransferFinderApp } from "@/components/transfer-finder/transfer-finder-app";
import players from "@/config/transfer-finder/mock-players.json";
import type { TransferFinderPlayer } from "@/components/transfer-finder/types";

export default function TransferFinderPage() {
  return <TransferFinderApp players={players as TransferFinderPlayer[]} />;
}
