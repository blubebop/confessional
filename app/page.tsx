import { Suspense } from "react";
import { myGame } from "@/components/my-game/myGameConfig";
import MyGameComponent from "@/components/my-game/MyGame";
import GameHudPage from "@/components/shared/GameHudPage";

export async function generateMetadata() {
  return {
    title: myGame.title,
    description: myGame.description,
  };
}

const MyGamePage: React.FC = () => {
  return (
    <GameHudPage>
      {/* No page-level <h1>: on the HUD layout the title lives in the HUD's own
          title bar (see components/shared/GameHud.tsx). */}
      {/* Suspense boundary is required: the game reads the ?id= replay param
          with useSearchParams(), which opts the subtree into client-side
          rendering. Without it the page cannot be prerendered and `npm run
          build` fails with a missing-suspense-with-csr-bailout error. */}
      <Suspense fallback={null}>
        <MyGameComponent game={myGame} />
      </Suspense>
    </GameHudPage>
  );
};

export default MyGamePage;
