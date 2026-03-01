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

export const commonItems: Item[] = [
    { name: "Ale", desc: "4 cp/mug, 2 sp/gal" },
    { name: "Bread", desc: "2 cp/loaf"},
    { name: "Cheese", desc: "1 sp/chunk"},
    { name: "Meat", desc: "3 sp/chunk"},
    { name: "Wine", desc: "2 sp/pitcher, 10 gp/bottle"},
    { name: "Banquet", desc: "10 gp/person"},
    { name: "Meal", desc: "3 cp - 2 gp per day"},
    { name: "Inn stay", desc: "7 cp - 4 gp per day"},
    { name: "Healing Potion", desc: "50 gp, 2d4 + 2"},
    { name: "Greater Healing Potion", desc: "200-250 gp, 4d4 + 4"},
    { name: "Superiori Healing Potion", desc: "2,000-2,500 gp, 8d4 + 8"},
    { name: "Supreme Healing Potion", desc: "20,000-25,000 gp, 10d4 + 20"},
    { name: "Uncommon", desc: "200 - 600 gp, ex: +1 items"},
    { name: "Rare", desc: "2,000 - 4,000 gp, ex: +2 items"},
    { name: "Very Rare", desc: "20,000 - 40,000 gp, ex: +3 items"},
    { name: "Scrolls", desc: "10 - 20 gp for cantrip, 2-5x per 1 level up"},
    { name: "Arrows", desc: "7 sp - 2 gp/20 arrows"},
    { name: "Bolts", desc: "7 sp - 2 gp/20 bolts"},
    { name: "Bowstring", desc: "1-3 gp/5 strings"},
    { name: "Javelin", desc: "3-8 gp"},
    { name: "Spear", desc: "7 sp - 2 gp"},
    { name: "Dagger", desc: "1 - 3 gp"},
    { name: "Longsword", desc: "11 - 22 gp"},
    { name: "Shortsword", desc: "7 - 15 gp"},
    { name: "Lance", desc: "7 - 15 gp"},
    { name: "Shield", desc: "7 - 15 gp"},
    { name: "Lamp", desc: "3 - 8 sp"},
    { name: "Lantern", desc: "3 - 15 gp"},
    { name: "Lock", desc: "7 - 15 gp"},
    { name: "Hunting Trap", desc: "3 - 8 gp"},
    { name: "Grappling Hook", desc: "1 - 3 gp"},
]