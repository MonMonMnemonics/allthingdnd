export type Item = {
    name: string,
    desc: string
}

export const abilityChecks: string[] = [
    "Athletics (STR): difficult climbing, jumping, swimming",
    "Acrobatics (DEX): balance check, dives, rolls, sommersaults, flip",
    "Sleight of Hand (DEX): pickpocket, concealing",
    "Stealth (DEX): sneaking, hiding, slipping away",
    "Arcana (INT): magic items, eldritch symbols, spells, lores",
    "History (INT): historical lore and story, place, person",
    "Investigation (INT): check for hidden object in particular, deduction from given facts",
    "Nature (INT): lore about terrain, plants, animals, weather",
    "Religion (INT): lore about rituals, prayers, deities, holy symbols",
    "Animal Handling (WIS): domesticating animals or controlling animals",
    "Insight (WIS): check for lies and intentions",
    "Medicine (WIS): diagnose illness, check for effect from potions",
    "Perception (WIS): check for ambushes, hidden things in general",
    "Survival (WIS): looking for tracks, predict weather, avoid natural hazards",
    "Deception (CHR): lying, misleading, conning",
    "Intimidation (CHR): over threatening, intimidating",
    "Performance (CHR): playing music, dancing, acting, storytelling",
    "Persuasion (CHR): peaceful negotiation and persuasion"
]

export const misc: { title:string, items: string[]}[] = [
    {
        title: "Movement",
        items: [
            "Climbing, swimming, crawling, difficult terrain: costs double",
            "Long jump: str score with 10 feet preparation, half without preparation",
            "High jump: 3 + str score with 10 feed preparation, half without preparation",
            "Vertical Reach: distance from ground + 1.5x height",
            "Forced march: 8+ hours, DC 10 + 1 for every hour after first 8 hours, add 1 exhaustion if fail"
        ]
    },
    {
        title: "Travel Pace",
        items: [
            "Fast: 400 feet/min, 4 miles/hour. 30 miles/day, -5 passive wisdom",
            "Normal: 300 feet/min, 3 miles/hour. 24 miles/day",
            "Slow: 200 feet/min, 2 miles/hour. 18 miles/day, able to stealth",
        ]
    },
    {
        title: "Environment Modifier",
        items: [
            "Fall: 1d6 per 10 feet fall",
            "Suffocate: 1 + const modifier minute min to 30 secs. If stays suffocate for 1 + const modifier round min to 1 round, drop to 0 hp next round",
            "Squeezed: 1 size smaller space, difficult terrain, disadv on attack and dex check, adv when attacked"
        ]
    },
    {
        title: "Food and Water",
        items: [
            "1 lb food per day, can starve for 3 + const mod min to 1 day, get 1 exhaustion per day after",
            "1 Gal water per day, 2 if weather is hot, DC 15 const check if only has half and auto 1 exhaustion per day if less",
            "Short rest 1 hour at least, long rest 8 hours at least"
        ]
    }
]