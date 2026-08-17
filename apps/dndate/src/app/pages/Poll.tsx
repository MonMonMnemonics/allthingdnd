import moment from "moment";
import { Fragment, useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import type { UserData, SelectedUser, PollData } from "@/common/types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBan, faCalendarDays, faFloppyDisk, faHouse, faInfoCircle, faLeaf, faLeftRight, faLockOpen, faMaximize, faMinimize, faPenToSquare, faPersonChalkboard, faPlus, faQuestionCircle, faSpinner, faTriangleExclamation, faUpDown, faUser, faXmark } from "@fortawesome/free-solid-svg-icons";
import { auxInfoEnum, timezones } from "@/common/consts";
import { ScheduleTable } from "../components/ScheduleTable";
import { UserInfoModal } from "../components/UserInfoModal";
import { GetLinkBtn } from "../components/GetLinkBtn";

interface UserModal {
    show: boolean,
    editMode: boolean,
    initData: {[index:string]: any}
}

export function Poll() {
    const { token } = useParams();
    const [ searchParams ] = useSearchParams();
    const [ pollExist, setPollExist ] = useState(true);
    const [ pollStyle, setPollStyle ] = useState("VERTICAL");
    const [ fullView, setFullView ] = useState(false);
    const [ timezone, setTimezone ] = useState(0);
    const [ timeslotShift, setTimeslotShift ] = useState(0);
    const [ guideModal, SetGuideModal ] = useState({
        show: false,
        states: Array(24).fill(0)
    });

    const [ pollData, setPollData ] = useState<PollData>({
        title: "POLL",
        description: "",
        timezone: "0",
        open: true,
        auxInfo: [],
        auxInfoCodes: [],
        timeslotHostLock: false,
        dates: []
    });
    const [ userData, setUserData ] = useState<UserData[]>([]);

    useEffect(() => {
        getPollData(true);
        if ((searchParams.get("style") ?? "A").toUpperCase() == "B") {
            setPollStyle("VERTICAL");
        }
    }, []);

    useEffect(() => {
        setTimeslotShift(Math.round((timezone - (Number(pollData.timezone ?? 0)))/30));
    }, [timezone, pollData.timezone]);

    async function getPollData(firstPull: boolean = false) {
        const res = await fetch("/api/poll/data", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                token: token,
                ott: (window.sessionStorage.getItem("OTT-" + token) ?? ""),
            })
        })

        if (res.status == 418) {
            setPollExist(false);

            let recentPolls: any = window.localStorage.getItem("recent-polls");
            if (!recentPolls) {
                recentPolls = [];
            } else {
                try {
                    recentPolls = JSON.parse(recentPolls);
                } catch (error) {
                    recentPolls = [];
                }

                if (!Array.isArray(recentPolls)) {
                    recentPolls = [];
                }
            }

            recentPolls = recentPolls.filter((e: any) => (e.token ?? "") != token);
            window.localStorage.setItem("recent-polls", JSON.stringify(recentPolls));
            return;
        }

        if (res.status != 200) {
            Swal.fire({
                title: "Server Error",
                theme: 'dark',
                icon: "error",
                text: "sorry for the inconvenience, please let admin know."
            });
        }

        const data = await res.json();
        const auxInfoCodes = [... new Set((data.pollData.auxInfo ?? []).map((e : any) => e.code))] as string[];
        data.pollData.auxInfo = auxInfoCodes.map((e: any) => data.pollData.auxInfo.find((e2: any) => e2.code == e));
        data.pollData.auxInfoCodes = auxInfoCodes;
        data.userData = data.userData.map((dt: any) => {
            for (const code of auxInfoCodes) {
                if (!(code in dt.auxInfo)) {
                    dt.auxInfo[code] = "";
                }
            }

            return dt;
        });
        
        data.pollData.dates = data.pollData.dates.map((e : {dateStart:string, dateEnd: string}) => {
            const dates: string[] = [];
            const momentStart = moment(e.dateStart);
            const momentEnd = moment(e.dateEnd);
    
            while (momentStart.isSameOrBefore(momentEnd)) {
                dates.push(momentStart.format("YYYY-MM-DD"));
                momentStart.add(1, "day");
            }
            
            return(dates);
        }).flat(1).sort((a: string, b: string) => moment(a).diff(moment(b)));

        setPollData(data.pollData);

        if ((data.firstSetup ?? false) == true) {
            for (const usr of (data.userData ?? [])) {
                if (usr.host == true) {
                    setSelectedUser({
                        id: usr.id,
                        host: usr.host,
                        auth: "OTT",
                        key: (window.sessionStorage.getItem("OTT-" + token) ?? ""),
                        auxInfo: usr.auxInfo
                    });
                    SetGuideModal({ show: true, states: Array(24).fill(0).map(() => Math.floor(Math.random()*3) - 1)});
                    break;
                }
            }
        }

        if (firstPull) {
            let recentPolls: any = window.localStorage.getItem("recent-polls");
            if (!recentPolls) {
                recentPolls = [];
            } else {
                try {
                    recentPolls = JSON.parse(recentPolls);
                } catch (error) {
                    recentPolls = [];
                }

                if (!Array.isArray(recentPolls)) {
                    recentPolls = [];
                }
            }

            recentPolls = recentPolls.filter((e: any) => (e.token ?? "") != token);
            recentPolls.unshift({
                token: token,
                title: data.pollData.title
            });

            if (recentPolls.length > 10) {
                recentPolls = recentPolls.slice(10);
            }

            window.localStorage.setItem("recent-polls", JSON.stringify(recentPolls));

            //-------------------------- SET TIMEZONE --------------------------
            let localTz: string | null = window.localStorage.getItem("local-tz");
            if (localTz) {
                setTimezone(Number(localTz));
                setUserData(shiftTimezone(Math.round((Number(localTz) - Number(data.pollData?.timezone ?? 0))/30), data.userData));
            } else {
                setTimezone(-(new Date().getTimezoneOffset()));
                setUserData(shiftTimezone(Math.round((-(new Date().getTimezoneOffset()) - Number(data.pollData?.timezone ?? 0))/30), data.userData));
            }
        } else {
            setUserData(shiftTimezone(Math.round((timezone - Number(data.pollData?.timezone ?? 0))/30), data.userData));
        }
    }

    async function withdrawApplication() {
        const swConf = await Swal.fire({
            title: "Withdraw?",
            theme: 'dark',
            icon: "warning",
            text: "Are you sure you want to withdraw your answer?",
            showCancelButton: true,
            focusConfirm: false,
            reverseButtons: true,
            cancelButtonText: "No",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes",
            confirmButtonColor: "#d33"
        })

        if (!swConf.isConfirmed) {
            return;
        }

        setLoading(true);
        const res = await fetch("/api/poll/withdraw", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                token: token,
                userData: selectedUser,
            })
        });

        if (res.status !== 200) {
            setLoading(false);
            Swal.fire({
                title: "Server Error",
                theme: 'dark',
                icon: "error",
                text: "sorry for the inconvenience, please let admin know."
            });
            return;
        }

        await getPollData();
        setLoading(false);
        
        setSelectedUser({
            ...selectedUser,
            id: -1,
            host: false
        });
    }

    async function cancelPoll() {
        const swConf = await Swal.fire({
            title: "Delete poll?",
            theme: 'dark',
            icon: "warning",
            text: "Are you sure you want to delete this poll?",
            showCancelButton: true,
            focusConfirm: false,
            reverseButtons: true,
            cancelButtonText: "No",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes",
            confirmButtonColor: "#d33"
        });

        if (!swConf.isConfirmed) {
            return;
        }

        setLoading(true);
        const res = await fetch("/api/poll/delete", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                token: token,
                userData: selectedUser,
            })
        });

        if (res.status !== 200) {
            setLoading(false);
            Swal.fire({
                title: "Server Error",
                theme: 'dark',
                icon: "error",
                text: "sorry for the inconvenience, please let admin know."
            });
            return;
        }

        await getPollData();
        setLoading(false);
        
        setSelectedUser({
            ...selectedUser,
            id: -1,
            host: false
        });

        let recentPolls: any = window.localStorage.getItem("recent-polls");
        if (!recentPolls) {
            recentPolls = [];
        } else {
            try {
                recentPolls = JSON.parse(recentPolls);
            } catch (error) {
                recentPolls = [];
            }

            if (!Array.isArray(recentPolls)) {
                recentPolls = [];
            }
        }

        recentPolls = recentPolls.filter((e: any) => (e.token ?? "") != token);
        window.localStorage.setItem("recent-polls", JSON.stringify(recentPolls));
    }

    async function switchClosePoll() {
        const swConf = await Swal.fire({
            title: pollData.open ? "Close poll?" : "Reopen Poll?",
            theme: 'dark',
            icon: "warning",
            text: pollData.open ? "Are you sure you want to close this poll?" : "Are you sure you want to reopen this poll?",
            showCancelButton: true,
            focusConfirm: false,
            reverseButtons: true,
            cancelButtonText: "No",
            confirmButtonText: "Yes",
        })

        if (!swConf.isConfirmed) {
            return;
        }

        setLoading(true);
        const res = await fetch("/api/poll/set-open", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                token: token,
                userData: selectedUser,
                open: !pollData.open
            })
        });

        if (res.status !== 200) {
            setLoading(false);
            Swal.fire({
                title: "Server Error",
                theme: 'dark',
                icon: "error",
                text: "sorry for the inconvenience, please let admin know."
            });
            return;
        }

        await getPollData();
        setLoading(false);
        
        setSelectedUser({
            ...selectedUser,
            id: -1,
            host: false
        });
    }

    async function deleteUser(userName: string, userId: number) {
        const swConf = await Swal.fire({
            title: "Delete member?",
            theme: 'dark',
            icon: "warning",
            text: "Are you sure you want to delete member " + userName + " ?",
            showCancelButton: true,
            focusConfirm: false,
            reverseButtons: true,
            cancelButtonText: "No",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes",
            confirmButtonColor: "#d33"
        })

        if (!swConf.isConfirmed) {
            return;
        }

        setLoading(true);
        const res = await fetch("/api/poll/delete-user", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                token: token,
                userData: selectedUser,
                userId: userId
            })
        });

        if (res.status !== 200) {
            setLoading(false);
            Swal.fire({
                title: "Server Error",
                theme: 'dark',
                icon: "error",
                text: "sorry for the inconvenience, please let admin know."
            });
            return;
        }

        await getPollData();
        setLoading(false);
    }

    function switchTimezone(newTimezone: number) {
        setTimezone(Number(newTimezone));
        setUserData(shiftTimezone(Math.round((newTimezone - timezone)/30), userData));
        window.localStorage.setItem("local-tz", newTimezone.toString());
    }

    function shiftTimezone(timeslotDiff: number, targetUserData: UserData[]): UserData[] {
        return(targetUserData.map((dt) => {
            dt.attendance = Object.fromEntries(Object.entries(dt.attendance).map(([dateKey, val]) => {
                const date = dateKey.slice(0, 10);
                const timeslotIdx = Number(dateKey.slice(11)) + timeslotDiff;

                if (timeslotIdx > 47) {
                    dateKey = moment(date, "YYYY-MM-DD", true).add(1, "d").format("YYYY-MM-DD") + "-" + (timeslotIdx - 48).toString();
                } else if (timeslotIdx < 0) {
                    dateKey = moment(date, "YYYY-MM-DD", true).add(-1, "d").format("YYYY-MM-DD") + "-" + (48 + timeslotIdx).toString();
                } else {
                    dateKey = date + "-" + timeslotIdx.toString();
                }
                return([dateKey, val]);
            }))
            return(dt);
        }));
    }

    //-------------------------- TABLE EDIT CONTROL --------------------------
    const [ selectedUser, setSelectedUser] = useState<SelectedUser>({
        id: -1,
        host: false,
        auth: "OTT",
        key: "",
        auxInfo: {}
    });

    const [ brushType, setBrushType ] = useState(1);
    const [ loading, setLoading ] = useState(false);
    const [ failCheck, setFailCheck ] = useState(0);

    function switchCellColour(date: string, timeslotIdx: number) {
        if (selectedUser.id != -1) {
            setUserData(userData.map(usr => {
                if (usr.id === selectedUser.id) {
                    const dateKey = date + "-" + timeslotIdx.toString();
                    if (brushType == -1) {
                        usr.attendance[dateKey] = false;
                    } else if (brushType == 0) {
                        delete usr.attendance[dateKey];
                    } else if (brushType == 1) {
                        usr.attendance[dateKey] = true;
                    }
                }
                return (usr);
            }));
        }
    }

    async function login(userName: string, userId: number) {
        const swConf = await Swal.fire({
            title: "Login",
            theme: 'dark',
            input: "password",
            inputPlaceholder: "password...",
            inputLabel: "Password",
            inputAttributes: {
                autocapitalize: "off",
                autocorrect: "off"
            },
            text: "Login password for username " + userName,
            showCancelButton: true,
            focusConfirm: false,
            reverseButtons: true,
            confirmButtonText: "Login",
            cancelButtonText: "Cancel",
            inputValidator: (val) => {
                if (!val) {
                    return "Please fill in password";
                }
            }
        })

        if (!swConf.isConfirmed) {
            return;
        }

        if (failCheck >= 3) {
            Swal.fire({
                title: "Login failed",
                theme: 'dark',
                icon: "error",
                text: "Make sure you choose the right user and enter the right password"
            });
        }

        setLoading(true);
        const res = await fetch("/api/poll/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                token: token,
                userId: userId,
                pass: swConf.value,
            })
        });
        setLoading(false);

        if (res.status !== 200) {            
            setFailCheck(failCheck + 1);

            if (failCheck > 2) {
                setTimeout(() => {
                    setFailCheck(0);
                }, 30*1000);
            }
            
            Swal.fire({
                title: "Login fail",
                theme: 'dark',
                icon: "error",
                text: "Make sure you choose the right user and enter the right password"
            });
            return;
        }

        const data = await res.json();
        const updatedUserData = userData.map(dt => {
            if (dt.id.toString() in data) {
                dt.auxInfo = {
                    ...dt.auxInfo,
                    ...data[dt.id.toString()]
                }
            }
            return dt;
        })
        setUserData(updatedUserData);

        const userDt = updatedUserData.find(e => e.id === userId);
        if (userDt)  {
            setSelectedUser({
                id: userId,
                host: userDt.host ?? false,
                auth: "PASS",
                key: swConf.value,
                auxInfo: userDt.auxInfo
            });
            setBrushType(1);
        }
    }

    async function save() {
        if (selectedUser.id < 0) {
            return;
        }

        const swConf = await Swal.fire({
            title: "Save changes?",
            theme: 'dark',
            icon: "question",
            showCancelButton: true,
            focusConfirm: false,
            reverseButtons: true,
            confirmButtonText: "Yes",
            cancelButtonText: "No"
        })
        
        if (!swConf.isConfirmed) {
            return;
        }

        const reShiftedUserData = shiftTimezone(Math.round((Number(pollData.timezone ?? 0) - timezone)/30), userData);
        const userDt = reShiftedUserData.find(usr => usr.id === selectedUser.id);
        if (userDt) {
            setLoading(true);
            const res = await fetch("/api/poll/save-att", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    token: token,
                    userData: selectedUser,
                    attData: userDt.attendance,
                })
            });

            if (res.status !== 200) {
                setLoading(false);
                Swal.fire({
                    title: "Server Error",
                    theme: 'dark',
                    icon: "error",
                    text: "sorry for the inconvenience, please let admin know."
                });
                return;
            }
    
            await getPollData();
            setLoading(false);
        } 

        Swal.fire({
            title: "Data Saved!",
            theme: 'dark',
            icon: "success",
        });

        setSelectedUser({
            ...selectedUser,
            id: -1,
            host: false
        });
    }

    //-------------------------- USER MODAL --------------------------
    const [ UserModal, setUserModal ] = useState<UserModal>({
        show: false,
        editMode: false,
        initData: {}
    });

    async function submitNewUser(data: {[index: string]: any}) {
        setLoading(true);
        const res = await fetch("/api/poll/create-user", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: data.name,
                pass: data.pass,
                auxInfo: data.auxInfo ?? {},
                token: token
            })
        });

        if (res.status !== 200) {
            setLoading(false);
            Swal.fire({
                title: "Server Error",
                theme: 'dark',
                icon: "error",
                text: "sorry for the inconvenience, please let admin know."
            });
            return;
        }

        const resData = await res.json();
        await getPollData();

        if ((data.pass ?? "") != "") {
            setSelectedUser({
                id: resData.userId,
                host: false,
                auth: "PASS",
                key: data.pass,
                auxInfo: data.auxInfo ?? {}
            });
        } else {
            setSelectedUser({
                id: resData.userId,
                host: false,
                auth: "OTT",
                key: resData.token,
                auxInfo: data.auxInfo ?? {}
            });
        }
        
        setUserModal({
            show: false,
            editMode: false,
            initData: {}
        });

        setLoading(false);
        setBrushType(1);

        const dateEl = document.getElementById("DateHeader-" + pollData.dates[0]);
        if (dateEl) {
            if (pollStyle == "VERTICAL") {
                dateEl.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                })
            } else {
                dateEl.scrollIntoView({
                    behavior: "smooth",
                    inline: "end"
                })
            }                                    
        }

        SetGuideModal({ show: true, states: Array(24).fill(0).map(() => Math.floor(Math.random()*3) - 1)});
    }

    async function submitInfoChange(data: {[index: string]: any}) {
        if (selectedUser.id < 0) {
            return;
        }

        const userDt = userData.find(usr => usr.id === selectedUser.id);
        if (userDt) {
            setLoading(true);
            const res = await fetch("/api/poll/save-info", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    token: token,
                    userData: {
                        ...selectedUser,
                        auxInfo: data
                    },
                })
            });

            if (res.status !== 200) {
                setLoading(false);
                Swal.fire({
                    title: "Server Error",
                    theme: 'dark',
                    icon: "error",
                    text: "sorry for the inconvenience, please let admin know."
                });
                return;
            }
    
            setUserData(userData.map(usr => {
                if (usr.id == selectedUser.id) {
                    usr.auxInfo = {
                        ...usr.auxInfo,
                        ...data
                    };
                }
                return usr;
            }));
            setLoading(false);
        } 

        setSelectedUser({
            ...selectedUser,
            auxInfo: data
        });

        setUserModal({
            show: false,
            editMode: false,
            initData: {}
        });
    }

    //-------------------------- AUX INFO MODAL --------------------------
    const [ auxInfoModal, setAuxInfoModal ] = useState<{
        show: boolean,
        name: string,
        auxInfo: {[index:string]: string}
    }>({
        show: false,
        name: "",
        auxInfo: {}
    })

    if (!pollExist) {
        return (
            <div className="flex flex-col w-screen h-screen p-3 gap-3">
                <div className="fixed h-full w-full z-10 flex flex-row">
                    <div className="bg-black opacity-40 fixed h-full w-full z-11"></div>
                    <div className="mx-auto flex flex-col">
                        <div className="my-auto rounded-lg p-8 border border-black bg-dark-secondary z-12 flex flex-col font-bold text-3xl gap-9">
                            <div className="w-full text-center">This poll doesn't exist... Or perhaps... The false hydra...</div>
                            <div className="w-full flex flex-row">
                                <button className="dark-button px-4 py-2 text-3xl rounded border flex items-center justify-center gap-2 font-light flex flex-row gap-2 items-center mx-auto"
                                    onClick={() => {window.location.href = "/"}} type="button"
                                >
                                    <FontAwesomeIcon icon={faHouse} />
                                    <div className="font-bold">Back</div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col w-screen h-screen p-3 gap-3">
            
            { //-------------------------- LOADING MODAL --------------------------
                loading && 
                <div className="fixed h-full w-full z-20 flex flex-row">
                    <div className="bg-black opacity-40 fixed h-full w-full z-21"></div>
                    <div className="mx-auto flex flex-col">
                        <div className="my-auto rounded-lg p-8 border border-black bg-dark-secondary z-22 flex flex-col font-bold text-3xl gap-5">
                            <div className="w-full flex flex-row justify-center">
                                <FontAwesomeIcon className="text-[10em] animate-spin" icon={faSpinner} />
                            </div>
                            <div className="w-full text-center">LOADING...</div>
                        </div>
                    </div>
                </div>
            }

            { //-------------------------- INFO MODAL --------------------------
                auxInfoModal.show && 
                <div className="fixed h-full w-full z-10 flex flex-row">
                    <div className="bg-black opacity-40 fixed h-full w-full z-11" onClick={() => setAuxInfoModal({...auxInfoModal, show: false})}></div>
                    <div className="mx-auto flex flex-col">
                        <div className="my-auto rounded-lg p-8 border border-black bg-dark-secondary z-12 flex flex-col font-bold gap-2 w-[30em]">
                            <div className="w-full text-center align-middle text-2xl">
                                {auxInfoModal.name}
                            </div>
                            <hr className="h-px my-2 bg-white border-0"/>
                            {
                                pollData.auxInfoCodes.includes(auxInfoEnum.discordHandle) ?
                                <div className="flex flex-row gap-2 items-center w-full">
                                    <div className="text-nowrap text-xl">Discord name:</div>
                                    <input
                                        value={auxInfoModal.auxInfo[auxInfoEnum.discordHandle]}
                                        placeholder="..."
                                        className="dark-input w-full p-2 rounded border font-light"
                                        readOnly={true}
                                    />
                                </div>
                                : null
                            }
                            {
                                pollData.auxInfoCodes.includes(auxInfoEnum.veils) ?
                                <div className="flex flex-col gap-2 items-center w-full">
                                    <div className="text-nowrap text-xl">Veils:</div>
                                    <textarea
                                        value={auxInfoModal.auxInfo[auxInfoEnum.veils]}
                                        placeholder="None"
                                        className="dark-input w-full p-2 rounded border font-light resize-none h-[7em]"
                                        readOnly={true}
                                    />
                                </div>
                                : null
                            }
                            {
                                pollData.auxInfoCodes.includes(auxInfoEnum.lines) ?
                                <div className="flex flex-col gap-2 items-center w-full">
                                    <div className="text-nowrap text-xl">Lines:</div>
                                    <textarea
                                        value={auxInfoModal.auxInfo[auxInfoEnum.lines]}
                                        placeholder="None"
                                        className="dark-input w-full p-2 rounded border font-light resize-none h-[7em]"
                                        readOnly={true}
                                    />
                                </div>
                                : null
                            }
                            <div className="flex flex-row items-center justify-center w- full">
                                <button className="bg-blue-600 px-3 py-1 rounded border flex items-center justify-center gap-2 font-light flex flex-row gap-2 items-center text-xl"
                                    onClick={() => setAuxInfoModal({...auxInfoModal, show: false})}
                                >
                                    <div className="font-bold">OK</div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            }

            { //-------------------------- INFO MODAL --------------------------
                guideModal.show && 
                <div className="fixed h-full w-full z-10 flex flex-row">
                    <div className="bg-black opacity-40 fixed h-full w-full z-11" onClick={() => SetGuideModal({ ...guideModal, show: false})}></div>
                    <div className="mx-auto flex flex-col">
                        <div className="my-auto rounded-lg p-8 border border-black bg-dark-secondary z-12 flex flex-col font-bold gap-2 w-[70vw] max-w-[760px] select-none">
                            <div className="w-full text-center align-middle text-2xl">
                                QUICK GUIDE
                            </div>
                            <hr className="h-px my-2 bg-white border-0"/>
                            <div className="max-h-[80vh] overflow-y-auto">
                                <div className="max-w-[760px] mx-auto px-[24px]">
                                    <div className="relative before:content-[''] before:absolute before:left-[27px] min-[520px]:before:left-[27px] max-[520px]:before:left-[21px] before:top-[12px] before:bottom-[12px] before:w-[1px] before:bg-gradient-to-b before:from-[#2ecc82] before:via-[#3d7dd6] before:to-[#6b7280] before:opacity-35">
                                        <div className="grid grid-cols-[44px_1fr] min-[520px]:grid-cols-[56px_1fr] gap-[14px] min-[520px]:gap-[24px] mb-[16px] relative">
                                            <div className="w-[44px] h-[44px] min-[520px]:w-[56px] min-[520px]:h-[56px] rounded-[11px] min-[520px]:rounded-[14px] bg-[#1a1f29] border border-[#2a3140] flex items-center justify-center font-mono text-[15px] min-[520px]:text-[18px] font-semibold text-[#2ecc82] z-10">
                                            1
                                            </div>
                                            <div className="bg-[#1a1f29] border border-[#2a3140] rounded-[14px] p-[22px_24px]">
                                                <h2 className="font-bold text-[19px] mb-[8px] leading-tight">Check your timezone</h2>
                                                <p className="text-[#8b93a3] text-[14.5px] max-w-[520px]">
                                                    Set your local timezone from the dropdown so hours line up correctly.
                                                </p>
                                                <div className="flex flex-row items-center gap-1 mt-2">
                                                    <div>Timezone:</div>
                                                    <select 
                                                        value={timezone}
                                                        onChange={(e) => switchTimezone(Number(e.target.value))}
                                                        className="font-bold px-2"
                                                    >
                                                        {timezones.map((tz, idx) => <option className="text-black" key={"opt-" + idx} value={tz.value}>{tz.label}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-[44px_1fr] min-[520px]:grid-cols-[56px_1fr] gap-[14px] min-[520px]:gap-[24px] mb-[16px] relative">
                                            <div className="w-[44px] h-[44px] min-[520px]:w-[56px] min-[520px]:h-[56px] rounded-[11px] min-[520px]:rounded-[14px] bg-[#1a1f29] border border-[#2a3140] flex items-center justify-center font-mono text-[15px] min-[520px]:text-[18px] font-semibold text-[#3d7dd6] z-10">
                                            2
                                            </div>
                                            <div className="bg-[#1a1f29] border border-[#2a3140] rounded-[14px] p-[22px_24px]">
                                                <h2 className="font-bold text-[19px] mb-[8px] leading-tight">Pick a mode, click and drag across the timeslots</h2>
                                                <p className="text-[#8b93a3] text-[14.5px] max-w-[520px]">
                                                    Choose what you're about to mark: <b className="text-[#e9edf3]">Preferred</b>, <b className="text-[#e9edf3]">Open</b>, or <b className="text-[#e9edf3]">No</b>. On your row, click and drag across the hours that fit the mode you selected. Repeat for each mode — the grid fills in as you go.
                                                </p>
                                                <div className="mt-[16px] bg-[#212836] border border-[#2a3140] rounded-[10px] p-[14px]">
                                                    <div className="flex flex-row items-center gap-6 text-xs">
                                                        <div className="flex flex-row items-center gap-2 select-none cursor-pointer ms-auto" onClick={() => setBrushType(1)}>
                                                            {
                                                                (selectedUser.id != -1) ? <input type="radio" checked={brushType == 1} readOnly/> : null
                                                            }
                                                            <div>Preferred</div>
                                                            <div className="bg-white w-[2ch] h-[2ch] rounded p-1 preferred"/>
                                                        </div>
                                                        <div className="flex flex-row items-center gap-2 select-none cursor-pointer" onClick={() => setBrushType(0)}>
                                                            {
                                                                (selectedUser.id != -1) ? <input type="radio" checked={brushType == 0} readOnly/> : null
                                                            }
                                                            <div>Open</div>
                                                            <div className="bg-white w-[2ch] h-[2ch] rounded p-1 open"/>
                                                        </div>
                                                        <div className="flex flex-row items-center gap-2 select-none cursor-pointer" onClick={() => setBrushType(-1)}>
                                                            {
                                                                (selectedUser.id != -1) ? <input type="radio" checked={brushType == -1} readOnly/> : null
                                                            }
                                                            <div>No</div>
                                                            <div className="bg-white w-[2ch] h-[2ch] rounded p-1 closed"/>
                                                        </div>
                                                    </div>
                                                    <div className='flex flex-row items-center justify-center mx-auto my-[7px] text-sm'>
                                                        <div>2026-03-07 (Saturday)</div>
                                                        <p className='cursor-pointer'>
                                                            <FontAwesomeIcon icon={faCalendarDays} className='mt-1'/>
                                                        </p>
                                                    </div>
                                                    <div className="grid grid-cols-24 gap-[2px]">
                                                    {guideModal.states.map((val, i) => {
                                                        let cellBgClass = (val == 1) ? 'preferred' : 
                                                            (val == -1) ? 'closed'
                                                            : 'open';
                                                        return <div key={i} className={"h-[20px] rounded-[2px] cursor-pointer " + cellBgClass} 
                                                            onMouseDown={(ev) => {
                                                                SetGuideModal({...guideModal, states: guideModal.states.map((e, idx) => (idx == i) ? brushType : e)});
                                                            }}
                                                            onMouseEnter={(ev) => {
                                                                if (ev.buttons === 1) {
                                                                    SetGuideModal({...guideModal, states: guideModal.states.map((e, idx) => (idx == i) ? brushType : e)});
                                                                }
                                                            }}
                                                        />;
                                                    })}
                                                    </div>
                                                    <div className="flex items-center gap-[8px] mt-[10px] text-[12px] text-[#8b93a3] font-mono">
                                                    <span className="text-[14px]">🖱️</span> drag → fills the selected color
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-[44px_1fr] min-[520px]:grid-cols-[56px_1fr] gap-[14px] min-[520px]:gap-[24px] mb-[16px] relative">
                                            <div className="w-[44px] h-[44px] min-[520px]:w-[56px] min-[520px]:h-[56px] rounded-[11px] min-[520px]:rounded-[14px] bg-[#1a1f29] border border-[#2a3140] flex items-center justify-center font-mono text-[15px] min-[520px]:text-[18px] font-semibold text-[#2ecc82] z-10">
                                            3
                                            </div>
                                            <div className="bg-[#1a1f29] border border-[#2a3140] rounded-[14px] p-[22px_24px]">
                                                    <h2 className="font-bold text-[19px] mb-[8px] leading-tight">Save your answer</h2>
                                                <p className="text-[#8b93a3] text-[14.5px] max-w-[520px]">
                                                    Click <b className="text-[#e9edf3]">Save</b> to lock in your availability. Changed your mind entirely? <b className="text-[#e9edf3]">Withdraw</b> removes your answer from the poll.
                                                </p>
                                                <div className="mt-[16px] flex gap-[10px] justify-center">
                                                    <button className="bg-green-600 px-3 py-1 rounded border flex items-center justify-center gap-2 font-light flex flex-row gap-2 items-center text-sm">
                                                        <FontAwesomeIcon icon={faFloppyDisk} />
                                                        <div className="font-bold">Save</div>
                                                    </button>
                                                    <button className="bg-red-600 px-3 py-1 rounded border flex items-center justify-center gap-2 font-light flex flex-row gap-2 items-center text-sm">
                                                        <FontAwesomeIcon icon={faXmark} />
                                                        <div className="font-bold">Withdraw</div>
                                                    </button>
                                                </div>
                                                <p className="mt-[16px] text-[#8b93a3] text-[14.5px] max-w-[520px]">
                                                    Click The pencil icon <FontAwesomeIcon className="cursor-pointer text-white text-xl" icon={faPenToSquare}/> next to your name lets you reopen and adjust your answer later.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-row items-center justify-center w- full">
                                    <button className="bg-blue-600 px-3 py-1 rounded border flex items-center justify-center gap-2 font-light flex flex-row gap-2 items-center text-xl"
                                        onClick={() => SetGuideModal({...guideModal, show:false})}
                                    >
                                        <div className="font-bold">Got it!</div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            }

            <UserInfoModal
                show={UserModal.show}
                editMode={UserModal.editMode}
                closeModal={() => setUserModal({...UserModal, show: false})}
                auxInfo={pollData.auxInfo}
                submitData={(data) => (UserModal.editMode) ? submitInfoChange(data.auxInfo ?? {}) : submitNewUser(data)}
                initData={UserModal.initData}                
            />

            <div className={"bg-dark-secondary rounded-lg p-3 border border-gray-500 text-dark-text flex flex-col gap-2" + ((fullView) ? "" :  " h-[33%]")}>
                <div className="flex flex-row">
                    <button className="dark-button p-1 text-2xl rounded border flex items-center justify-center gap-2 font-light flex flex-row gap-2 items-center"
                        onClick={() => {window.location.href = "/"}} type="button"
                    >
                        <FontAwesomeIcon icon={faHouse} />
                        <div className="font-bold">Back</div>
                    </button>
                    <div className="grow h-full flex flex-col">
                        <div className="my-auto text-center font-bold text-3xl">
                            {pollData.title}
                        </div>
                    </div>
                    {
                        (!pollData.open) ?
                            <div className="text-red-500 text-3xl font-bold border border-2 border-red-500 py-1 px-2 rounded">
                                POLL CLOSED
                            </div>
                        : <GetLinkBtn token={token ?? ""}/>
                    }
                </div>
                {
                    (!fullView) &&
                    <Fragment>
                        <hr className="h-px my-2 bg-white border-0"/>
                        <div className="grow flex flex-row gap-2">
                            <div className="h-full w-[30em] flex flex-col gap-3">
                                <div className="flex flex-row items-center">
                                    <div className="font-bold text-xl me-auto">Members</div>
                                    {
                                        ((selectedUser.id == -1) && (pollData.open)) ?
                                        <button className="bg-green-600 px-3 py-1 rounded border flex items-center justify-center gap-2 font-light flex flex-row gap-2 items-center"
                                            onClick={() => setUserModal({
                                                show: true,
                                                editMode: false,
                                                initData: {}
                                            })}
                                        >
                                            <div className="font-bold">Join!</div>
                                            <FontAwesomeIcon icon={faPlus} />
                                        </button>
                                        : null
                                    }
                                </div>
                                <div className="grow relative flex flex-col">
                                    <div className="h-full w-full absolute gap-2 overflow-y-auto px-2">
                                        <ul className="list-none font-bold">
                                            {
                                                userData.map((user, idx) => (
                                                    <li key={'user-list-' + idx}><div className={"flex flex-row gap-2 items-center p-2 rounded border " + ((user.id === selectedUser.id) ? "bg-gray-700 border-green-500" : "border-gray-500")}>
                                                        <FontAwesomeIcon icon={faUser}/>
                                                        <div className="w-full">{user.name + (user.host ? " (GM)" : "")} </div>
                                                    </div></li>
                                                ))
                                            }
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <div className="w-px mx-2 bg-white border-0"/>
                            <textarea
                                value={pollData.description}
                                placeholder="Description of the poll is here... If only the host provided one..."
                                className="transparent-input w-full p-2 rounded border font-light resize-none grow"
                                readOnly={true}
                            />
                            <div className="w-px mx-2 bg-white border-0"/>
                            <div className="h-full w-[35em] flex flex-col gap-2">
                                <div className="flex flex-row w-full justify-center items-center gap-3 font-bold text-2xl">
                                    <FontAwesomeIcon icon={faQuestionCircle}/>
                                    <div>Guide</div>
                                    <FontAwesomeIcon icon={faQuestionCircle}/>
                                </div>
                                <hr className="h-px bg-gray-600 border-0"/>
                                <div className="grow px-3 font-bold text-xs">
                                    <ul className="list-disc">
                                        <li>Just click "Join+" to add your name and fill in your availability.</li>
                                        <li>Click pencil symbol next to your name in the table to edit your answer.</li>
                                        <li>Editing as the host allows you to see extra information submitted.</li>
                                        <li>Share url link as it is to invite other people.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>                        
                    </Fragment>
                }
            </div>
            <div className="bg-dark-secondary rounded-lg p-3 border border-gray-500 text-dark-text flex flex-col gap-2 grow">
                <div className="flex flex-row justify-between items-center font-bold text-xl">
                    <div className="flex flex-row items-center gap-1">
                        <div>Timezone:</div>
                        <select 
                            value={timezone}
                            onChange={(e) => switchTimezone(Number(e.target.value))}
                            className="font-bold text-xl px-2"
                        >
                            {timezones.map((tz, idx) => <option className="text-black" key={"opt-" + idx} value={tz.value}>{tz.label}</option>)}
                        </select>
                    </div>
                    {
                        (selectedUser.id !== -1) ?
                            <div className="flex flex-row items-center gap-2">
                                <button className="bg-green-600 px-3 py-1 rounded border flex items-center justify-center gap-2 font-light flex flex-row gap-2 items-center text-xl"
                                    onClick={save} type="button"
                                >
                                    <FontAwesomeIcon icon={faFloppyDisk} />
                                    <div className="font-bold">Save</div>
                                </button>
                                {
                                    (!selectedUser.host) ?
                                        <Fragment>
                                            {
                                                (pollData.auxInfo.length > 0) ?
                                                    <button className="bg-blue-600 px-3 py-1 rounded border flex items-center justify-center gap-2 font-light flex flex-row gap-2 items-center text-xl"
                                                        onClick={() => setUserModal({
                                                            show: true,
                                                            editMode: true,
                                                            initData: {
                                                                ...selectedUser.auxInfo,
                                                                name: (userData.find(e => e.id === selectedUser.id)?.name ?? "")
                                                            }
                                                        })} type="button"
                                                    >
                                                        <FontAwesomeIcon icon={faInfoCircle} />
                                                        <div className="font-bold">Edit Answer</div>
                                                    </button>
                                                : null
                                            }
                                            <button className="bg-red-600 px-3 py-1 rounded border flex items-center justify-center gap-2 font-light flex flex-row gap-2 items-center text-xl"
                                                onClick={withdrawApplication} type="button"
                                            >
                                                <FontAwesomeIcon icon={faXmark} />
                                                <div className="font-bold">Withdraw</div>
                                            </button>
                                        </Fragment>
                                    : <Fragment>
                                        <button className="bg-blue-600 px-3 py-1 rounded border flex items-center justify-center gap-2 font-light flex flex-row gap-2 items-center text-xl"
                                            onClick={switchClosePoll} type="button"
                                        >
                                            <FontAwesomeIcon icon={ pollData.open ? faBan : faLockOpen }/>
                                            <div className="font-bold">{ pollData.open ? "Close Poll" : "Reopen Poll" }</div>
                                        </button>
                                        <button className="bg-red-600 px-3 py-1 rounded border flex items-center justify-center gap-2 font-light flex flex-row gap-2 items-center text-xl"
                                            onClick={cancelPoll} type="button"
                                        >
                                            <FontAwesomeIcon icon={faXmark} />
                                            <div className="font-bold">Delete Poll</div>
                                        </button>
                                    </Fragment>
                                }
                                <FontAwesomeIcon className="text-4xl cursor-pointer" onClick={() => SetGuideModal({ show: true, states: Array(24).fill(0).map(() => Math.floor(Math.random()*3) - 1)})} icon={faQuestionCircle}/>
                            </div>                            
                        : null
                    }
                    <div className="h-full flex flex-row items-center gap-5">
                        <div className="flex flex-col gap-2 w-[36ch]">
                            <div className="flex flex-row items-center gap-6">
                                <div className="flex flex-row items-center gap-2 select-none cursor-pointer" onClick={() => setBrushType(1)}>
                                    {
                                        (selectedUser.id != -1) ? <input type="radio" checked={brushType == 1} readOnly/> : null
                                    }
                                    <div>Preferred</div>
                                    <div className="bg-white w-[2ch] h-[2ch] rounded-lg p-3 preferred"/>
                                </div>
                                <div className="flex flex-row items-center gap-2 select-none cursor-pointer" onClick={() => setBrushType(0)}>
                                    {
                                        (selectedUser.id != -1) ? <input type="radio" checked={brushType == 0} readOnly/> : null
                                    }
                                    <div>Open</div>
                                    <div className="bg-white w-[2ch] h-[2ch] rounded-lg p-3 open"/>
                                </div>
                                <div className="flex flex-row items-center gap-2 select-none cursor-pointer" onClick={() => setBrushType(-1)}>
                                    {
                                        (selectedUser.id != -1) ? <input type="radio" checked={brushType == -1} readOnly/> : null
                                    }
                                    <div>No</div>
                                    <div className="bg-white w-[2ch] h-[2ch] rounded-lg p-3 closed"/>
                                </div>
                            </div>
                            <div className="text-sm h-[2ch] flex flex-row items-center gap-1">
                                <FontAwesomeIcon icon={faTriangleExclamation} />
                                <div>= Host unavailable{(selectedUser.id != -1) ? ". Click and drag timeslot to fill" : ""}</div>                                 
                            </div>
                        </div>
                        <button className="bg-dark rounded-xl border border-3 h-full aspect-square flex flex-col"
                            onClick={() => setPollStyle((pollStyle == "VERTICAL") ? "HORIZONTAL" : "VERTICAL")}
                        >
                            <div className="flex my-auto flex-row">
                                <FontAwesomeIcon icon={(pollStyle == "VERTICAL") ? faLeftRight : faUpDown} className="mx-auto font-bold text-3xl"/>
                            </div>
                        </button>
                        <button className="bg-dark rounded-xl border border-3 h-full aspect-square flex flex-col"
                            onClick={() => setFullView(!fullView)}
                        >
                            <div className="flex my-auto flex-row">
                                <FontAwesomeIcon icon={fullView ? faMinimize : faMaximize} className="mx-auto font-bold text-3xl"/>
                            </div>
                        </button>
                    </div>
                </div>
                <div className="flex flex-row text-sm font-bold items-center gap-4 px-2">
                    {
                        pollData.auxInfoCodes.includes(auxInfoEnum.firstTimer) ?
                        <div className="flex flex-row items-center gap-1">
                            <FontAwesomeIcon icon={faLeaf} className="text-green-600"/>
                            <div>: First-timer</div>
                        </div>
                        : null
                    }
                    {
                        pollData.auxInfoCodes.includes(auxInfoEnum.helpCharCreate) && (selectedUser.host) ?
                        <div className="flex flex-row items-center gap-1">
                            <FontAwesomeIcon icon={faPersonChalkboard}/>
                            <div>: Need a guide creating char</div>
                        </div>
                        : null
                    }
                </div>
                
                <div className="grow flex flex-row gap-5">
                    <ScheduleTable
                        pollStyle={pollStyle}
                        userData={userData}
                        dateSlot={pollData.dates}
                        auxInfoCodes={pollData.auxInfoCodes}
                        activeUserId={selectedUser.id}
                        isHost={selectedUser.host}
                        timeslotHostLock={pollData.timeslotHostLock}
                        timeslotShift={timeslotShift}

                        login={login}
                        switchCellColour={switchCellColour}
                        deleteUser={deleteUser}
                        setAuxInfoModal={setAuxInfoModal}
                    />
                </div>
            </div>
        </div>
    );
}

export default Poll;