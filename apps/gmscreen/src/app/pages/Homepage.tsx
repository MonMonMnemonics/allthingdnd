import { faChessKnight, faDice, faTablet } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Homepage() {
    return (
        <div className="w-screen h-screen flex flex-col p-5">
            <div className="flex flex-row my-auto">
                <div className="flex flex-col mx-auto p-7 border border-white rounded-3xl gap-5">
                    <div className="text-2xl font-bold">DnD Quick References + GM Utilities</div>
                    <hr/>
                    <button className="flex flex-row items-center justify-center font-bold text-xl border border-white rounded-2xl py-2 gap-3"
                        onClick={() => window.location.assign("/att-roll-comparison")}
                    >
                        <div>Roll Attribute Comparison</div>
                        <FontAwesomeIcon icon={faDice}/>
                    </button>
                    <button className="flex flex-row items-center justify-center font-bold text-xl border border-white rounded-2xl py-2 gap-3"
                        onClick={() => window.location.assign("/player-ref")}
                    >
                        <div>Player Quick Ref</div>
                        <FontAwesomeIcon icon={faChessKnight}/>
                    </button>
                    <button className="flex flex-row items-center justify-center font-bold text-xl border border-white rounded-2xl py-2 gap-3">
                        <div>GM Screen and Utilities</div>
                        <FontAwesomeIcon icon={faTablet}/>
                    </button>
                </div>                
            </div>
        </div>
    )
}