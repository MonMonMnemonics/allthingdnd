import pbHistData from "../../../static/pb_hist.json";
import stdHistData from "../../../static/std_hist.json";
import rollHistData from "../../../static/roll_hist.json";
import { Bar, BarChart, Cell, Label, XAxis, YAxis } from "recharts";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRightFromBracket } from "@fortawesome/free-solid-svg-icons";

interface Stat {
    avg: number,
    dev: number
}

export default function AttRollComparison() {
    const [ pbStat, setPbStat ] = useState<Stat>({
        avg: 0,
        dev: 0
    });
    const [ stdStat, setStdStat ] = useState<Stat>({
        avg: 0,
        dev: 0
    });
    const [ rollStat, setRollStat ] = useState<Stat>({
        avg: 0,
        dev: 0
    });
    
    const [ rollAvgTarget, setRollAvgTarget] = useState(108);
    const [ rollLowLimit, setRollLowLimit] = useState(18);
    const [ rollHighLimit, setRollHighLimit] = useState(108);

    useEffect(() => {
        let avg = Object.entries(pbHistData).reduce((acc, curr) => {
            return acc += Number(curr[0])*curr[1]
        }, 0);
        let dev = Object.entries(pbHistData).reduce((acc, curr) => {
            return acc += (Number(curr[0]) - avg)*(Number(curr[0]) - avg)*curr[1]
        }, 0);
        dev = Math.sqrt(dev);
        setPbStat({avg: avg, dev: dev});

        avg = Object.entries(stdHistData).reduce((acc, curr) => {
            return acc += Number(curr[0])*curr[1]
        }, 0);
        dev = Object.entries(stdHistData).reduce((acc, curr) => {
            return acc += (Number(curr[0]) - avg)*(Number(curr[0]) - avg)*curr[1]
        }, 0);
        dev = Math.sqrt(dev);
        setStdStat({avg: avg, dev: dev});
    }, []);

    useEffect(() => {
        let avg = 0;
        let dev = 0;
        let upperLim = 0;
        let ci = 0;

        for (const el of Object.entries(rollHistData)) {
            if (Number(el[0]) < rollLowLimit) {
                continue;
            }

            if ((avg + Number(el[0])*Number(el[1]))/(ci + Number(el[1])) > rollAvgTarget) {
                break;
            }
            
            avg += Number(el[0])*Number(el[1]);
            ci += Number(el[1]);
            upperLim = Number(el[0]);
        }
        avg /= ci;

        for (const el of Object.entries(rollHistData)) {
            if (Number(el[0]) < rollLowLimit) {
                continue;
            }
            
            if (Number(el[0]) == upperLim) {
                break;
            }

            dev += (Number(el[0]) - avg)*(Number(el[0]) - avg)*Number(el[1])/ci;
        }

        setRollStat({
            avg: avg,
            dev: Math.sqrt(dev)
        });
        setRollHighLimit(upperLim);
    }, [rollAvgTarget, rollLowLimit])

    return(
        <div className="w-screen h-screen flex flex-col p-5 gap-3">
            <div className="absolute top-3 right-0 flex flex-col gap-2 z-3">
                <div className="bg-black border border-2 border-r-0 ps-3 pe-4 py-2 rounded-l-xl cursor-pointer flex flex-row items-center gap-1 font-bold" title={"Homepage"}
                    onClick={() => window.location.assign("/")}
                >
                    <div className="text-xl">Home</div>
                    <FontAwesomeIcon className="text-xl" icon={faArrowRightFromBracket}/>
                </div>
            </div>

            <div className="h-full border rounded-2xl border-2 flex flex-col p-3 gap-2">
                <div className="w-full text-center text-2xl font-bold">Standard Array</div>
                <hr/>
                <div className="w-full flex flex-row gap-2 flex-grow relative">
                    <div className="flex flex-col gap-2 h-full w-[45em]">
                        <div className="font-bold text-xl mb-auto">
                            Starting with 6 numbers 15, 14, 13, 12, 10, and 8. Choose which number to assign to which ability score.
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 text-nowrap flex-grow me-7">
                        <div className="font-bold text-xl">Average Total: {stdStat.avg}</div>
                        <div className="font-bold text-xl">Standard Deviation: {stdStat.dev}</div>
                    </div>
                    <BarChart
                        style={{
                            height: "100%",
                            aspectRatio: 1.618*2
                        }}
                        margin={{
                            left: 7,
                            top: 3,
                            bottom: 13
                        }}
                        data={Object.entries(stdHistData).map(e => ({key: e[0], val: e[1]}))}
                    >
                        <XAxis dataKey={"key"}>
                            <Label value="Total Ability Score" offset={-10} position="insideBottom" />
                        </XAxis>
                        <YAxis 
                            width={"auto"}
                            label={{
                                value: "Probability",
                                angle: -90,
                                position: "insideLeft",
                                textAnchor: "middle"
                            }}
                        />
                        <Bar dataKey={"val"} fill="#62a068"/>
                    </BarChart>
                </div>         
            </div>
            <div className="h-full border rounded-2xl border-2 flex flex-col p-3 gap-2">
                <div className="w-full text-center text-2xl font-bold">Point Buy</div>
                <hr/>
                <div className="w-full flex flex-row gap-2 flex-grow relative justify-between">
                    <div className="flex flex-col gap-3 h-full w-[45em]">
                        <div className="font-bold text-xl">
                            Starting with 27 points, you assign a value to each ability score following table below
                        </div>
                        <table className="table-auto text-xl font-bold">
                            <thead>
                                <tr>
                                    <th>Value</th>
                                    <th>Cost</th>
                                    <th>Value</th>
                                    <th>Cost</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="text-center">8</td>
                                    <td className="text-center">0</td>
                                    <td className="text-center">12</td>
                                    <td className="text-center">4</td>
                                </tr>
                                <tr>
                                    <td className="text-center">9</td>
                                    <td className="text-center">1</td>
                                    <td className="text-center">13</td>
                                    <td className="text-center">5</td>
                                </tr>
                                <tr>
                                    <td className="text-center">10</td>
                                    <td className="text-center">2</td>
                                    <td className="text-center">14</td>
                                    <td className="text-center">7</td>
                                </tr>
                                <tr>
                                    <td className="text-center">11</td>
                                    <td className="text-center">3</td>
                                    <td className="text-center">15</td>
                                    <td className="text-center">9</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="flex flex-col gap-2 text-nowrap flex-grow me-7">
                        <div className="font-bold text-xl">Average Total: {Math.round(pbStat.avg*100)/100}</div>
                        <div className="font-bold text-xl">Standard Deviation: {Math.round(pbStat.dev*100)/100}</div>
                    </div>
                    <BarChart
                        style={{
                            height: "100%",
                            aspectRatio: 1.618*2
                        }}
                        margin={{
                            left: 7,
                            top: 3,
                            bottom: 13
                        }}
                        data={Object.entries(pbHistData).map(e => ({key: e[0], val: e[1]}))}
                    >
                        <XAxis dataKey={"key"}>
                            <Label value="Total Ability Score" offset={-10} position="insideBottom" />
                        </XAxis>
                        <YAxis 
                            width={"auto"}
                            label={{
                                value: "Probability",
                                angle: -90,
                                position: "insideLeft",
                                textAnchor: "middle"
                            }}
                        />
                        <Bar dataKey={"val"} fill="#62a068"/>
                    </BarChart>
                </div>         
            </div>
            <div className="h-full border rounded-2xl border-2 flex flex-col p-3 gap-2">
                <div className="w-full text-center text-2xl font-bold">Roll</div>
                <hr/>
                <div className="w-full flex flex-row gap-2 flex-grow relative justify-between">
                    <div className="flex flex-col gap-3 h-full w-[45em]">
                        <div className="font-bold text-xl">
                            Roll 4d6 and drop lowest. Do this 6 times to get 6 numbers, then assign each number to ability score of your chosing.
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 text-nowrap flex-grow me-7 font-bold text-xl">
                        <div>Average Total: {Math.round(rollStat.avg*100)/100}</div>
                        <div>Standard Deviation: {Math.round(rollStat.dev*100)/100}</div>
                        <div className="flex flex-row items-center gap-2">
                            <div>Average Total Limit:</div>
                            <input 
                                type="range" step={0.01} min={18} max={108} 
                                value={rollAvgTarget} onChange={(e) => setRollAvgTarget(Number(e.target.value ?? 108))} 
                            />
                            <div className="w-[3em] cursor-pointer"
                                onClick={() => {
                                    Swal.fire({
                                        theme: "dark",
                                        text: "Average Limit",
                                        input: "number",
                                        inputAttributes: {
                                            step: "0.01",
                                            min: "18",
                                            max: "108"
                                        },
                                        inputValue: rollAvgTarget,
                                    }).then(res => {
                                        if ((res.value != "") && (res.isConfirmed)) {
                                            setRollAvgTarget(res.value);
                                        }
                                    })
                                }}
                            >{rollAvgTarget}</div>
                        </div>
                        <div className="flex flex-row items-center gap-2">
                            <div>Lower Total Limit:</div>
                            <input 
                                type="range" step={1} min={18} max={108} 
                                value={rollLowLimit} onChange={(e) => {
                                    if (Number(e.target.value) <= rollHighLimit) {
                                        setRollLowLimit(Number(e.target.value ?? 18));
                                    } else {
                                        setRollLowLimit(rollHighLimit);
                                    }
                                }} 
                            />
                            <div>{rollLowLimit}</div>
                        </div>
                        <div>Upper Total Limit: {rollHighLimit}</div>
                    </div>
                    <BarChart
                        style={{
                            height: "100%",
                            aspectRatio: 1.618*2
                        }}
                        margin={{
                            left: 7,
                            top: 3,
                            bottom: 13
                        }}
                        data={Object.entries(rollHistData).map(e => ({key: e[0], val: e[1]}))}
                    >
                        <XAxis dataKey={"key"}>
                            <Label value="Total Ability Score" offset={-10} position="insideBottom" />
                        </XAxis>
                        <YAxis 
                            width={"auto"}
                            label={{
                                value: "Probability",
                                angle: -90,
                                position: "insideLeft",
                                textAnchor: "middle"
                            }}
                        />
                        <Bar dataKey={"val"}>
                            {
                                Object.entries(rollHistData).map(e => ({key: e[0], val: e[1]})).map((e) => 
                                    <Cell key={"cell-" + e.key} fill={((Number(e.key) < rollLowLimit) || (Number(e.key) > rollHighLimit)) ? "#838585" : "#62a068"}></Cell>
                                )
                            }
                        </Bar>
                    </BarChart>
                </div>         
            </div>
        </div>
    )
}