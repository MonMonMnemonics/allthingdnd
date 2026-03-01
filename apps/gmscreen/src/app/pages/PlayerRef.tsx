import { action, bonusAction, notes, reaction } from "@/common/dnd5e/combats";
import type { Item } from "@/common/dnd5e/general";
import { conditions } from "@/common/dnd5e/conditions";
import { faArrowRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

function ItemComponent({item, idx}: {item: Item, idx: number}) {
    const [ showTooltip, setShowTooltip ] = useState(false);

    return(
        <div className="group relative text-center py-2 px-3 border rounded-2xl text-xl flex flex-col cursor-pointer"
            onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)}
        >
            <div className="my-auto text-center">
                {item.name}
            </div>
            {
                (item.desc != "") ?
                <div className="absolute bg-green-600 left-1/2 top-10 ml-auto mr-auto min-w-max scale-0 -translate-x-1/2 rounded-lg px-2 py-1 font-bold transition-all duration-500 z-1 group-has-hover:scale-100">
                    <div className="flex max-w-xs flex-col items-center">
                        <div className="rounded-xl p-2 text-center text-sm text-white">
                            {item.desc}
                        </div>
                    </div>
                </div>
                : null
            }
        </div>
    )
}

export default function PlayerRef() {
    return(
        <div className="w-screen h-screen flex flex-col p-5 gap-3">
            <div className="flex flex-row items-center font-bold gap-2 text-xl">
                <div className="grow text-center">Player's quick reference</div>
                <div className="flex flex-row items-center gap-1 cursor-pointer"
                    onClick={() => window.location.assign("/")}
                >
                    <FontAwesomeIcon icon={faArrowRightFromBracket}/>
                    <div>Back</div>
                </div>
            </div>
            <div className="border rounded-2xl flex flex-col gap-1 font-bold p-2">
                <div>Combat Action</div>
                <hr/>
                <div className="h-full grid grid-flow-row grid-cols-5 gap-3 m-2">
                    {
                        action.map((item, idx) => (
                            <ItemComponent key={"act-" + item.name} item={item} idx={idx}/>
                        ))
                    }
                </div>
            </div>
            <div className="border rounded-2xl flex flex-col gap-1 font-bold p-2">
                <div>Combat Bonus Action</div>
                <hr/>
                <div className="h-full grid grid-flow-row grid-cols-5 gap-3 m-2">
                    {
                        bonusAction.map((item, idx) => (
                            <ItemComponent key={"bon-act-" + item.name} item={item} idx={idx}/>
                        ))
                    }
                </div>
            </div>
            <div className="border rounded-2xl flex flex-col gap-1 font-bold p-2">
                <div>Combat Reaction</div>
                <hr/>
                <div className="h-full grid grid-flow-row grid-cols-5 gap-3 m-2">
                    {
                        reaction.map((item, idx) => (
                            <ItemComponent key={"react-" + item.name} item={item} idx={idx}/>
                        ))
                    }
                </div>
            </div>
            <div className="flex flex-row grow gap-3">
                <div className="border rounded-2xl flex flex-col grow gap-1 font-bold p-2">
                    <div>Condition</div>
                    <hr/>
                    <div className="grow relative">
                        <div className="absolute h-full w-full overflow-y-auto overflow-x-hide p-2">
                            <ul className="list-disc ms-4">
                                {
                                    conditions.map((cond, idx) => <li key={"cond-" + idx}>{cond.name + ": " + cond.effect}</li>)
                                }                    
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="border rounded-2xl flex flex-col grow gap-1 font-bold p-2">
                    <div>Notes</div>
                    <hr/>
                    <div className="grow relative">
                        <div className="absolute h-full w-full overflow-y-auto overflow-x-hide p-2">
                            <ul className="list-disc ms-4">
                                {
                                    notes.map((note, idx) => <li key={"note-" + idx}>{note}</li>)
                                }                    
                            </ul>
                        </div>
                    </div>
                </div>
            </div>            
        </div>
    )
}