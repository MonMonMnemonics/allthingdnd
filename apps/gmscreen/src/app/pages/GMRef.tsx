import { Fragment, useState } from "react"
import { Notebook, Swords, UserSearch } from "lucide-react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRightFromBracket, faBookmark, faBoxesStacked } from "@fortawesome/free-solid-svg-icons";
import { abilityChecks, commonItems, misc } from "@/common/dnd5e/general";
import { action, bonusAction, notes, reaction, sizes } from "@/common/dnd5e/combats";
import { conditions } from "@/common/dnd5e/conditions";
import { advancement, multiclassingReq, spellAtt, spellSlots } from "@/common/dnd5e/chars";

const modes = [
    {mode: "GENERAL", icon: <Notebook strokeWidth={3} size={"1.2em"}/>},
    {mode: "COMBAT", icon: <Swords strokeWidth={3} size={"1.2em"}/>},
    {mode: "CHAR", icon: <UserSearch strokeWidth={3} size={"1.2em"}/>},
]

function adjustStringCase(text: string) {
    return (text.charAt(0).toUpperCase() + text.slice(1).toLowerCase())
}

export default function GmRef() {
    const [showSidebar, setShowSidebar] = useState(false);
    const [mode, setMode] = useState("GENERAL")

    return(
        <div className="w-screen h-screen overflow-hidden relative">
            <div className={"absolute top-5 right-0 cursor-pointer font-bold text-2xl transition-all duration-500 z-100 " + (showSidebar ? "translate-x-[100%]" : "translate-x-[0px]")} title="Open bookmark"
                onClick={() => setShowSidebar(true)}
            >
                <div className="py-2 bg-black px-2 pe-3 border border-3 rounded-l-2xl border-r-0">
                    <FontAwesomeIcon icon={faBookmark}/>
                </div>
            </div>
            <div className={"absolute top-5 right-0 flex flex-col gap-2 font-bold text-2xl transition-all duration-500 z-100 select-none " + (showSidebar ? "translate-x-[0px]" : "translate-x-[100%]")}>
                <div className="py-2 bg-black px-2 pe-3 border border-3 rounded-l-2xl border-r-0 flex flex-row items-center gap-2 cursor-pointer"
                    onClick={() => window.location.assign("/")}
                >
                    <FontAwesomeIcon icon={faArrowRightFromBracket}/>
                    <div className="w-full">Home</div>
                </div>
                {
                    modes.map((item) => 
                        <div key={"bookmark-" + item.mode} className="py-2 bg-black px-2 pe-3 border border-3 rounded-l-2xl border-r-0 flex flex-row items-center gap-2 cursor-pointer"
                            onClick={() => {
                                setShowSidebar(false);
                                setMode(item.mode);
                            }}
                        >
                            {item.icon}
                            <div className="w-full">{ adjustStringCase(item.mode) }</div>
                        </div>
                    )
                }
            </div>
            <div className="w-screen h-screen flex flex-col p-5 select-none" onClick={() => setShowSidebar(false)}>
                {
                    (mode == "GENERAL") ?
                        <div className="grow w-full flex flex-row gap-3 font-bold">
                            <div className="w-[30em] h-full border rounded-2xl flex flex-col gap-1 p-2">
                                <div className="text-xl text-center">Ability Checks</div>
                                <hr/>
                                <div className="grow relative">
                                    <div className="absolute h-full w-full overflow-y-auto overflow-x-hide p-2">
                                        <ul className="list-disc ms-4">
                                            {
                                                abilityChecks.map((note, idx) => <li key={"note-" + idx}>{note}</li>)
                                            }                    
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div className="grow h-full p-2 grid grid-flow-col grid-rows-3 gap-3">
                                {
                                    misc.map((item, idx) =>
                                        <div key={"general-" + item.title} className="border rounded-2xl flex flex-col gap-1 p-2">
                                            <div className="text-xl text-center">{item.title}</div>
                                            <hr/>
                                            <div className="grow relative">
                                                <div className="absolute h-full w-full overflow-y-auto overflow-x-hide p-2">
                                                    <ul className="list-disc ms-4">
                                                        {
                                                            item.items.map((text, idx) => <li key={"gen-" + item.title + "-" + idx}>{text}</li>)
                                                        }                    
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                }
                                <div className="border rounded-2xl flex flex-col gap-1 p-2 row-span-2">
                                    <div className="text-xl text-center">Common Items</div>
                                    <div className="text-center">10 cp = 1 sp, 5 sp = 1 ep, 2 ep = 1 gp, 10 gp = 1 pp</div>
                                    <hr/>
                                    <div className='relative grow select-none flex flex-col'>
                                        <div className="max-h-full w-full flex flex-col absolute overflow-y-auto ms-2 pe-2 pb-2">
                                            <table className='table-auto p-2' style={{ width: 'auto' }}>
                                                <thead className="sticky top-0">
                                                    <tr>
                                                        <th className="bg-[#1a1a1a]">Item</th>
                                                        <th className="bg-[#1a1a1a]">Price Range</th>
                                                    </tr>                                                    
                                                </thead>
                                                <tbody>
                                                    {
                                                        commonItems.map((item, idx) => 
                                                            <tr key={"item-price-" + idx}>
                                                                <td>{item.name}</td>
                                                                <td>{item.desc}</td>
                                                            </tr>
                                                        )
                                                    }
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    : (mode == "COMBAT") ? 
                        <div className="grow w-full flex flex-row gap-3 font-bold">
                            <div className="grow h-full p-2 grid grid-flow-col grid-rows-2 gap-3">
                                <div className="border rounded-2xl flex flex-col gap-1 p-2">
                                    <div className="text-xl text-center">Action</div>
                                    <hr/>
                                    <div className="grow relative">
                                        <div className="absolute h-full w-full overflow-y-auto overflow-x-hide p-2">
                                            <ul className="list-disc ms-4">
                                                {
                                                    action.map((item, idx) => <li key={"action-" + idx}>{item.name + ((item.desc != "") ? ": " + item.desc : "")}</li>)
                                                }                    
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                <div className="border rounded-2xl flex flex-col gap-1 p-2">
                                    <div className="text-xl text-center">Bonus Action</div>
                                    <hr/>
                                    <div className="grow relative">
                                        <div className="absolute h-full w-full overflow-y-auto overflow-x-hide p-2">
                                            <ul className="list-disc ms-4">
                                                {
                                                    bonusAction.map((item, idx) => <li key={"bonus-action-" + idx}>{item.name + ((item.desc != "") ? ": " + item.desc : "")}</li>)
                                                }                    
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="text-xl text-center">Reaction</div>
                                    <hr/>
                                    <div className="grow relative">
                                        <div className="absolute h-full w-full overflow-y-auto overflow-x-hide p-2">
                                            <ul className="list-disc ms-4">
                                                {
                                                    reaction.map((item, idx) => <li key={"reaction-" + idx}>{item.name + ((item.desc != "") ? ": " + item.desc : "")}</li>)
                                                }                    
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                <div className="border rounded-2xl flex flex-col gap-1 p-2">
                                    <div className="text-xl text-center">Conditions</div>
                                    <hr/>
                                    <div className="grow relative">
                                        <div className="absolute h-full w-full overflow-y-auto overflow-x-hide p-2">
                                            <ul className="list-disc ms-4">
                                                {
                                                    conditions.map((item, idx) => <li key={"cond-" + idx}>{item.name + ": " + item.effect}</li>)
                                                }                    
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                <div className="border rounded-2xl flex flex-col gap-1 p-2">
                                    <div className="text-xl text-center">Sizes</div>
                                    <hr/>
                                    <div className="grow relative">
                                        <div className="absolute h-full w-full overflow-y-auto overflow-x-hide p-2">
                                            <ul className="list-disc ms-4">
                                                {
                                                    sizes.map((item, idx) => <li key={"size-" + idx}>{item}</li>)
                                                }                    
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                <div className="border rounded-2xl flex flex-col gap-1 p-2 row-span-2">
                                    <div className="text-xl text-center">Notes</div>
                                    <hr/>
                                    <div className="grow relative">
                                        <div className="absolute h-full w-full overflow-y-auto overflow-x-hide p-2">
                                            <ul className="list-disc ms-4">
                                                {
                                                    notes.map((item, idx) => <li key={"note-" + idx}>{item}</li>)
                                                }                    
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div> 
                    : (mode == "CHAR") ? 
                        <div className="grow w-full flex flex-row gap-3 font-bold">
                            <div className="grow h-full p-2 grid grid-flow-col grid-rows-2 gap-3">
                                <div className="border rounded-2xl flex flex-col gap-1 p-2">
                                    <div className="text-xl text-center">Advancement</div>
                                    <hr/>
                                    <div className="grow relative">
                                        <div className="absolute h-full w-full overflow-y-auto overflow-x-hide p-2">
                                            <ul className="list-disc ms-4">
                                                {
                                                    advancement.map((item, idx) => <li key={"adv-" + idx}>{item}</li>)
                                                }                    
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                <div className="border rounded-2xl flex flex-col gap-1 p-2">
                                    <div className="text-xl text-center">Multiclassing Requirement</div>
                                    <hr/>
                                    <div className="grow relative">
                                        <div className="absolute h-full w-full overflow-y-auto overflow-x-hide p-2">
                                            <ul className="list-disc ms-4">
                                                {
                                                    multiclassingReq.map((item, idx) => <li key={"multreq-" + idx}>{item}</li>)
                                                }                    
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                <div className="border rounded-2xl flex flex-col gap-1 p-2">
                                    <div className="text-xl text-center">Spellcasting</div>
                                    <div className="text-xl">Spell DC save: 8 + proficiency + main attribute bonus</div>
                                    <div className="text-xl">Spell attack modifier: proficiency + main attribute bonus</div>
                                    <hr/>
                                    <div className="grow relative">
                                        <div className="absolute h-full w-full overflow-y-auto overflow-x-hide p-2">
                                            <ul className="list-disc ms-4">
                                                {
                                                    spellAtt.map((item, idx) => <li key={"spell-" + idx}>{item}</li>)
                                                }                    
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                <div className="border rounded-2xl flex flex-col gap-1 p-2">
                                    <div className="text-xl text-center">Spellslots</div>
                                    <div className='relative grow select-none flex flex-col'>
                                        <div className="max-h-full w-full flex flex-col absolute overflow-y-auto ms-2 pe-2 pb-2">
                                            <table className='table-fixed' style={{ width: 'auto' }}>
                                                <tbody>
                                                    {
                                                        spellSlots.map((item, idx) => 
                                                            <Fragment key={"sslot-" + idx}>
                                                                <tr className="border-t-2 rounded">
                                                                    <td colSpan={20} className="text-center font-bold py-1">{ item.classes.join(", ") }</td>
                                                                </tr>
                                                                <tr>
                                                                    {
                                                                        item.slots.map((slots, idx2) => 
                                                                            <td key={"sslot-" + idx + "-" + idx2} className="border-l-1 border-dashed first:border-l-0">
                                                                                <div className="flex flex-col w-full gap-1 px-1 pb-2">
                                                                                    {
                                                                                        slots.map((e, idx3) => 
                                                                                            <div key={"sslot-" + idx + "-" + idx2 + "-" + idx3} 
                                                                                                className="w-full text-center border rounded-2xl"
                                                                                            >{ e }</div>
                                                                                        )
                                                                                    }
                                                                                </div>
                                                                            </td>
                                                                        )
                                                                    }
                                                                </tr>
                                                            </Fragment>
                                                        )
                                                    }
                                                    <tr className="border-t-2 rounded">
                                                        <td colSpan={20} className="text-center font-bold py-1">Warlock</td>
                                                    </tr>
                                                    <tr>
                                                        {
                                                            ["S", "S", "", "", "", "", "", "", "", "", "S", "", "", "", "", "", "S", "", "", ""].map((e, idx) =>
                                                                <td key={"sslot-warlock-" + idx} className="border-l-1 border-dashed first:border-l-0">
                                                                    {
                                                                        (e != "") ?
                                                                            <div className="flex flex-col w-full gap-1 px-1 pb-2">
                                                                                <div className="w-full text-center border rounded-2xl">{ e }</div>
                                                                            </div>
                                                                        : null
                                                                    }
                                                                </td>
                                                            )
                                                        }
                                                    </tr>
                                                    <tr>
                                                        {
                                                            [1,1,2,2,3,3,4,4,5,5,5,5,5,5,5,5,5,5,5,5].map((e, idx) =>
                                                                <td key={"sslot-warlock-level-" + idx} className="border-l-1 border-dashed first:border-l-0 text-center">
                                                                    {e}
                                                                </td>
                                                            )
                                                        }
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>                                    
                                </div>
                            </div>
                        </div>
                    : null
                }
            </div>
        </div>
    )
}