import { action, bonusAction, notes, reaction, type Item } from "@/common/dnd5e/combats";
import { conditions } from "@/common/dnd5e/conditions";
import type { Condition } from "@/common/dnd5e/conditions";
import { faArrowRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function ItemComponent({item, idx}: {item: Item, idx: number}) {
    return(
        <div className="group relative text-center py-2 px-3 border rounded-2xl text-xl flex flex-col cursor-pointer">
            <div className="my-auto text-center">
                {item.name}
            </div>
            {
                item.desc != "" ?
                <div className="absolute left-1/2 top-10 ml-auto mr-auto min-w-max -translate-x-1/2 scale-0 transform rounded-lg px-3 py-2 font-bold transition-all duration-500 group-hover:scale-100">
                    <div className="flex max-w-xs flex-col items-center">
                        <div className="bg-black rounded-xl p-2 text-center text-sm text-white">
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
            <div className="border rounded-2xl flex flex-col grow gap-1 font-bold p-2">
                <div>Combat Action</div>
                <hr/>
                <div className="grow relative">
                    <div className="absolute h-full w-full overflow-y-hide overflow-x-auto p-2">
                        <div className="h-full grid grid-flow-col grid-rows-3 gap-3">
                            {
                                action.map((item, idx) => (
                                    <ItemComponent key={"act-" + item.name} item={item} idx={idx}/>
                                ))
                            }
                        </div>
                    </div>
                </div>
            </div>
            <div className="border rounded-2xl flex flex-col grow gap-1 font-bold p-2">
                <div>Combat Bonus Action</div>
                <hr/>
                <div className="grow relative">
                    <div className="absolute h-full w-full overflow-y-hide overflow-x-auto p-2">
                        <div className="h-full grid grid-flow-col grid-rows-1 gap-3">
                            {
                                bonusAction.map((item, idx) => (
                                    <ItemComponent key={"bon-act-" + item.name} item={item} idx={idx}/>
                                ))
                            }
                        </div>
                    </div>
                </div>
            </div>
            <div className="border rounded-2xl flex flex-col grow gap-1 font-bold p-2">
                <div>Combat Reaction</div>
                <hr/>
                <div className="grow relative">
                    <div className="absolute h-full w-full overflow-y-hide overflow-x-auto p-2">
                        <div className="h-full grid grid-flow-col grid-rows-1 gap-3">
                            {
                                reaction.map((item, idx) => (
                                    <ItemComponent key={"react-" + item.name} item={item} idx={idx}/>
                                ))
                            }
                        </div>
                    </div>
                </div>
            </div>
            <div className="border rounded-2xl flex flex-col grow gap-1 font-bold p-2">
                <div className="grow relative">
                    <div className="absolute h-full w-full overflow-y-auto overflow-x-hide p-2">
                        <ul className="list-disc ms-4">
                            {
                                notes.map(note => <li>{note}</li>)
                            }                    
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}