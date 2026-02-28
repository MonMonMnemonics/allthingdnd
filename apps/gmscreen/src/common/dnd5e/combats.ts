export type Item = {
    name: string,
    desc: string
}

export const action: Item[] = [
    { name: "Attack/Cast magic", desc: ""},
    { name: "Dash", desc: "Double movement speed for the turn"},
    { name: "Disengage", desc: "Negate attack of opportunity"},
    { name: "Dodge", desc: "Attacked with disadv until next turn"},
    { name: "Help", desc: "5 feet range, add adv to other's action"},
    { name: "Ready", desc: "Declare trigger for reaction, ready spell (onlu up to 1 action casting time) counted as concentration"},
    { name: "Grapple", desc: "1 size larger max, str or dex contest, drag uses 1 extra move speed"},
    { name: "Shove", desc: "1 size larger max, str or dex contest, push 5 feet away and proned"},
    { name: "Stabilize", desc: "DC 10 medicine, stabilize unconscious"},
    { name: "Hide", desc: ""},
    { name: "Search", desc: ""},
    { name: "Use object", desc: ""},
]

export const bonusAction: Item[] = [
    { name: "Off-hand attack", desc: "Light weapon, don't add damage modifier"},
    { name: "Cast magic", desc: ""},
    { name: "Drink potion", desc: ""},
]

export const reaction: Item[] = [
    { name: "Opportunity of attack", desc: ""},
    { name: "Readied attack", desc: ""},
    { name: "Cast magic", desc: ""},
]

export const notes: string[] = [
    "Instant death if dmg 2x mx hap",
    "Death saving throw DC 10, success and failure reset after stabilize",
    "Ranged weapon (normal range/long range). Between normal and long range or melee range roll with disadv",
    "Two-weapon, must be both light, don't add dmg modifier for the off-hand",
    "Crits double damage dice",
    "Standing from prone or mount/dismount cost half speed",
    "Resist: halved dmg",
    "Vulnerable: doubled dmg",
    "Knocking out: only melee, if hit to 0 hp",
    "Falling from mount: DC 10 dex, prone 5 feet away if fail",
    "Underwater: attack with disadv if 0 speed left, range can only hit in normal range with disadv, fire resist",
    "Concentration: Break if cast other concentration or incapacitated. If attacked, roll DC 10 or half damage (bigger one) constituation check",
    "Ritual casting: Need special skill, 10 min casting time, doesn't spend spell slot, cannot upcast",
    "Spell attack roll: Counted as range attack (disadv at 5 feet), D20 + proficiency + casting attribute modifier"
]