import { faArrowRightFromBracket, faHandHoldingDroplet, faHelmetSafety, faHouse, faPersonHalfDress } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react"
import AttRollComparison from "../components/NewCharacter/AttRollComparison";

const binderDivider = [
    { mode: "Race", icon: faPersonHalfDress, title: "Race", label: "Race"},
    { mode: "Class", icon: faHelmetSafety, title: "Class", label: "Class"},
    { mode: "Ability", icon: faHandHoldingDroplet, title: "Ability Point", label: "Ability"},
]

export default function NewCharacter() {
    const [ mode, setMode ] = useState("Home");

    return(
        <div className="w-screen h-screen relative">
            <div className="absolute top-3 right-0 flex flex-col gap-2 z-3">
                <div className="bg-black border border-2 border-r-0 ps-3 pe-4 py-2 rounded-l-xl cursor-pointer" title={"Homepage"}
                    onClick={() => window.location.assign("/")}
                >
                    <div className="text-2xl">Home</div>
                    <FontAwesomeIcon className="text-2xl" icon={faArrowRightFromBracket}/>
                </div>
                {
                    binderDivider.map((dv) => 
                        <div key={"binder-div-" + dv.mode} title={dv.title} onClick={() => setMode(dv.mode)}
                            className="bg-black border border-2 border-r-0 ps-3 pe-4 py-2 rounded-l-xl cursor-pointer flex flex-row gap-2 items-center" 
                        >
                            <div className="text-2xl">{dv.label}</div>
                            <FontAwesomeIcon className="text-2xl" icon={dv.icon}/>
                        </div>
                    )
                }
            </div>

            {
                (mode == "Home") ?
                <div className="w-screen h-screen flex flex-col">
                    <div className="flex flex-row my-auto">
                        <div className="mx-auto border border-white p-7 rounded-2xl flex flex-col gap-3 font-bold">
                            <div className="text-center text-3xl">Quick Reference:</div>
                            <div className="text-center text-3xl">Making A New Character</div>
                            <hr/>
                            <div>Just follow the binder divider on the top right from top to bottom.</div>
                        </div>
                    </div>
                </div>
                : (mode == "Ability") ?
                    <AttRollComparison/>
                : null

            }
        </div>
    )
}