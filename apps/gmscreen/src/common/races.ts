interface Race {
    race: string,
    size: string,
    speed: string,
    feature: string[],
    proficiency: string[],
    language: string[],
    subraces: {
        subrace: string,
        feature: string[],
        proficiency: string[]
    }[]
}

export const races: Race[] = [
    {
        race: "Dwarf",
        size: "4-5 feet tall, medium",
        speed: "25 feet",
        feature: [
            "+2 constitution",
            "Poison resistance",
            "Darkvision",
            "History check on stonework double proficiency bonus",
        ],
        proficiency: [
            "Battleaxe",
            "Handaxe",
            "Throwing hammer",
            "Warhammer",
            "One of smith, brewer, or mason tool"
        ],
        language: ["Common", "Dwarvish"],
        subraces: [
            {
                subrace: "Hill dwarf",
                feature: ["+1 wisdom", "+1 max hp per level"],
                proficiency: []
            },
            {
                subrace: "Mountain dwarf",
                feature: ["+2 strength"],
                proficiency: ["light armor", "medium armor"]
            }
        ]
    },
    {
        race: "Elf",
        size: "5-6 feet tall, medium",
        speed: "30 feet",
        feature: [
            "+2 dexterity",
            "Darkvision",
            "Advantage saving throw vs charm",
            "Sleep immunity",
        ],
        proficiency: [
            "Perception",
        ],
        language: ["Common", "Elvish"],
        subraces: [
            {
                subrace: "High elf",
                feature: [
                    "+1 intelligence", 
                    "1 cantrip from wizard using int modifier",
                    "+1 extra language"
                ],
                proficiency: [
                    "Longsword",
                    "Shortsword",
                    "Longbow",
                    "Shortbow",
                ]
            },
            {
                subrace: "Wood elf",
                feature: ["+1 wisdom", "+5 move", "Can use hide in wilderness"],
                proficiency: [
                    "Longsword",
                    "Shortsword",
                    "Longbow",
                    "Shortbow",
                ]
            },
            {
                subrace: "Dark elf",
                feature: [
                    "+1 charisma", 
                    "120 ft darkvision", 
                    "Disadvantage on attack or perception under direct sunlight",
                    "Drowmagic: dancing light @ lvl 1, fearie fire @ lvl 3, darkness @ lvl 5, once per day, use charisma modifier"
                ],
                proficiency: [
                    "Shortsword",
                    "Hand crossbow",
                    "Rapier",
                ]
            }
        ]
    },
    {
        race: "Halfling",
        size: "3 feet tall, small",
        speed: "25 feet",
        feature: [
            "+2 dexterity",
            "Reroll once when get 1 for attack and check",
            "Advantage against frightened",
            "Move through space of any creature larger size"
        ],
        proficiency: [],
        language: ["Common", "Halfling"],
        subraces: [
            {
                subrace: "Lightfoot",
                feature: ["+1 charisma", "can hide when obscured behind a larger creature"],
                proficiency: []
            },
            {
                subrace: "Stout",
                feature: ["+1 charisma", "poison resistance"],
                proficiency: []
            }
        ]
    },
    {
        race: "Human",
        size: "5-6 feet tall, medium",
        speed: "30 feet",
        language: ["Common", "+1 extra language"],
        proficiency: [],
        feature: [
            "+1 in all ability score or variant: +1 feat, +1 for 2 abilty score, +1 skill instead",
        ],
        subraces: []
    },
    {
        race: "Dragonborn",
        size: "6 feet tall, medium",
        speed: "30 feet",
        language: ["Common", "Draconic"],
        proficiency: [],
        feature: [
            "+2 strength",
            "+1 charisma",
            "Breath weapon, dex save DC 8 + constitution + proficiency, half damage if success, damage type follow subrace, 2d6 @ lvl 1, 3d6 @ lvl 6, 4d6 @ lvl 11, 5d6 @ lvl16",
            "Damage resistance follows subrace"
        ],
        subraces: [
            { subrace: "Black", proficiency: [], feature: ["Acid affinity", "5 ft by 30 ft line breath weapon"]},
            { subrace: "Blue", proficiency: [], feature: ["Lightning affinity", "5 ft by 30 ft line breath weapon"]},
            { subrace: "Brass", proficiency: [], feature: ["Fire affinity", "5 ft by 30 ft line breath weapon"]},
            { subrace: "Bronze", proficiency: [], feature: ["Lightning affinity", "5 ft by 30 ft line breath weapon"]},
            { subrace: "Copper", proficiency: [], feature: ["Acid affinity", "5 ft by 30 ft line breath weapon"]},
            { subrace: "Gold", proficiency: [], feature: ["Fire affinity", "15 ft cone breath weapon"]},
            { subrace: "Green", proficiency: [], feature: ["Poison affinity", "15 ft cone breath weapon"]},
            { subrace: "Red", proficiency: [], feature: ["Fire affinity", "15 ft cone breath weapon"]},
            { subrace: "Silver", proficiency: [], feature: ["Cold affinity", "15 ft cone breath weapon"]},
            { subrace: "White", proficiency: [], feature: ["Cold affinity", "15 ft cone breath weapon"]},
        ]
    },
    {
        race: "Gnome",
        size: "3-4 feet tall, Small",
        speed: "25 feet",
        language: ["Common", "Gnomish"],
        proficiency: [],
        feature: [
            "+2 intelligence",
            "Darkvision",
            "Advantage on intelligence, wisdom, and charisma saving throws against magic"
        ],
        subraces: [
            {
                subrace: "Forest Gnome",
                feature: ["+1 dexterity", "minor illusion cantrip with intelligence modifier", "Communicate with small beasts"],
                proficiency: []
            },
            {
                subrace: "Rock Gnome",
                feature: [
                    "+1 constitution", 
                    "History check on magic, technology, alchemy item gives double proficiency bonus",
                    "Tinker: create a tiny clockwork with artisan or tinker tool (AC 5, 1 hp, 5 feet speed), can start fire, make sound"
                ],
                proficiency: ["Artisan tool"]
            }
        ]
    },
    {
        race: "Half elf",
        size: "5-6 feet tall, medium",
        speed: "30 feet",
        language: ["Common", "Elvish", "+1 extra"],
        feature: [
            "+2 charisma",
            "+1 for other two ability scores of your choice",
            "Darkvision",
            "Advantage saving throw against charm and immune to sleep"
        ],
        proficiency: ["+2 Proficiency of your choice"],
        subraces: []
    },
    {
        race: "Half orc",
        size: "5-6 feet tall, medium",
        speed: "30 feet",
        language: ["Common", "Orc"],
        feature: [
            "+2 strength",
            "+1 constitution",
            "Darkvision",
            "Once per long rest, when you drop to 0 hp, drop to 1 hp instead",
            "When critical can add +1 damage dice"
        ],
        proficiency: ["intimidation"],
        subraces: []
    }, 
    {
        race: "Tiefling",
        size: "5-6 feet tall, medium",
        speed: "30 feet",
        language: ["Common", "Infernal"],
        feature: [
            "+1 intelligence",
            "+2 charisma",
            "Darkvision",
            "Fire resistance",
            "Infernal legacy: 2nd level Hellish Rebuke @ lvl 3, Darkness @ lvl 5. Once per day, charisma modifier"
        ],
        proficiency: [],
        subraces: []
    }
]