$(function(){
    function finder(arr, name){
        return arr.find((e) => {return e.name === name;});
    }
    $.getJSON('data.json', function(data) {
        let gatherRates = data.units[0].gathering;
        //Get all of the gather rates with various upgrades applied.
        gatherRates["wheelbarrow"] = {gatherRate: gatherRates.farmer.gatherRate + finder(data.upgrades, "wheelbarrow").effects.gatherRate};
        gatherRates["hand cart"] = {gatherRate: gatherRates.farmer.gatherRate + finder(data.upgrades, "wheelbarrow").effects.gatherRate + finder(data.upgrades, "hand cart").effects.gatherRate};
        gatherRates["double-bit axe"] = {
            gatherRate: 
                parseFloat(
                (
                gatherRates.lumberjack.gatherRate * 
                parseFloat(finder(data.upgrades, "double-bit axe").effects.gatherRate[1].substr(1))
                ).toFixed(2)
                )
        };
        gatherRates["bow saw"] = {
            gatherRate: 
                parseFloat(
                (
                gatherRates.lumberjack.gatherRate * 
                parseFloat(finder(data.upgrades, "double-bit axe").effects.gatherRate[1].substr(1)) *
                parseFloat(finder(data.upgrades, "bow saw").effects.gatherRate[1].substr(1))
                ).toFixed(2)
                )
        };
        gatherRates["two-man saw"] = {
            gatherRate: 
                parseFloat(
                (
                gatherRates.lumberjack.gatherRate * 
                parseFloat(finder(data.upgrades, "double-bit axe").effects.gatherRate[1].substr(1)) *
                parseFloat(finder(data.upgrades, "bow saw").effects.gatherRate[1].substr(1)) *
                parseFloat(finder(data.upgrades, "two-man saw").effects.gatherRate[1].substr(1))
                ).toFixed(2)
                )
        };
        gatherRates["gold mining"] = {
            gatherRate: 
                parseFloat(
                (
                gatherRates["gold miner"].gatherRate * 
                parseFloat(finder(data.upgrades, "gold mining").effects.gatherRate[1].substr(1))
                ).toFixed(2)
                )
        };
        gatherRates["gold shaft mining"] = {
            gatherRate: 
                parseFloat(
                (
                gatherRates["gold miner"].gatherRate * 
                parseFloat(finder(data.upgrades, "gold mining").effects.gatherRate[1].substr(1)) *
                parseFloat(finder(data.upgrades, "gold shaft mining").effects.gatherRate[1].substr(1))
                ).toFixed(2)
                )
        };
        gatherRates["stone mining"] = {
            gatherRate: 
                parseFloat(
                (
                gatherRates["stone miner"].gatherRate * 
                parseFloat(finder(data.upgrades, "stone mining").effects.gatherRate[1].substr(1))
                ).toFixed(2)
                )
        };
        gatherRates["stone shaft mining"] = {
            gatherRate: 
                parseFloat(
                (
                gatherRates["stone miner"].gatherRate * 
                parseFloat(finder(data.upgrades, "stone mining").effects.gatherRate[1].substr(1)) *
                parseFloat(finder(data.upgrades, "stone shaft mining").effects.gatherRate[1].substr(1))
                ).toFixed(2)
                )
        };
        
        let gatherRatesCont = $("<div class='gather-rates'></div>");
        
        
        let resOrder = ["food", "wood", "gold", "stone"];
        let order = [
            ["farmer", "wheelbarrow", "hand cart", "hunter", "shepherd", "forager"],
            ["lumberjack", "double-bit axe", "bow saw","two-man saw"],
            ["gold miner", "gold mining", "gold shaft mining"],
            ["stone miner", "stone mining", "stone shaft mining"]
        ];
        //Add some special cases to the vilsRequired
        data.units.push({name: "crossbowman", cost:finder(data.units, "archer").cost, trainTime: 27, img: "crossbowman"});
        
        /*data.units.push({name: "eagle scout - castle age", cost:finder(data.units, "eagle scout").cost, trainTime: 35, img:"eagle scout"});
        data.units.push({name: "elite eagle warrior", cost:finder(data.units, "eagle scout").cost, trainTime: 20});
        
        data.units.push({name: "heavy cavalry archer", cost:finder(data.units, "cavalry archer").cost, trainTime: 27});
        data.units.push({name: "imperial camel rider", cost:finder(data.units, "camel rider").cost, trainTime: 20});
        data.units.push({name: "elite steppe lancer", cost:finder(data.units, "steppe lancer").cost, trainTime: 20});
        
        data.units.push({name: "town center - castle age", cost:finder(data.units, "town center").cost, trainTime: 150, img: "town center"});
        */
        
        //Which resources we have data but don't show (takes up too much space)
        let noShow = ["hunter", "shepherd", "forager"];
        //Which units to show and in what order.
        let unitsShown = ["villager", "militia", "spearman", "eagle scout", "archer", "crossbowman", "skirmisher", "cavalry archer", "scout cavalry", "knight", "camel rider", "battle elephant", "battering ram", "mangonel", "scorpion", "fishing ship", "fire galley", "galley", "demolition ship", "house"];
        
        let unitDescs = {
            "villager": "<p>In the Dark Age, you'll mostly be collecting sheep, hunt(boar/deer), and berries. Conventional wisdom dictates that having 6 on sheep allows for constant villager production throughout the Dark Age, but this is only because you start with 200 food. In the case of the Chinese (start with 0 food), 7 villagers on sheep is preferred.</p>"+
                      "<p>If you are booming in Castle Age with 3 town centers, you will need a minimum of 19/17/15 farms, otherwise you can buy food from the market to maintain villager production. 4 town centers require 25/22/20 farms.</p>"+
                      "<p>Indians get cheaper villagers and Persians get faster creation time on their town centers.</p>",
            "militia": "<p>Militia are the only military unit available in the Dark Age, so going for a drush (Dark Age rush) is a very common strategy on open maps such as Arabia. You will generally only produce a limited number of them in Dark Age, so being able to maintain production is not important at this point. The most common number to produce in Dark Age is 3.</p>"+
                       "<p>In Feudal Age, you can upgrade militia to man-at-arms, which makes them much scarier to villagers. You can also get the supplies upgrade, which reduces their food cost to 45 from 60. The cost of supplies is 150f 100g and it takes 35 seconds to research. To make this upgrade worth it (in total resource cost), you must produce at least 17 more militia.</p>"+
                       "<p>Once your opponent gets walls and archers, your men-at-arms will have a hard time doing damage since the archers will just kite (run and shoot) your units, so adding skirmishers or towers to your push are some good ways to make men-at-arms more viable in Feudal Age.</p>"+
                       "<p>The Goths get cheaper infantry starting in Feudal Age, which reduces the militia's cost to 39f 13g. They also produce infantry 20% faster in all ages, which reduces their creation time from 21 seconds to 17.5 seconds. After conscription (no perfusion), it's 13.1 seconds. After perfusion (no conscription), they produce in 8.7 seconds.  After conscription and perfusion, it's only 6.5 seconds.</p>",
               
            "spearman": "",
            "archer": "",
            "skirmisher": "",
            "cavalry archer":"",
            "scout cavalry": "<p>Cumans with steppe husbandry train scouts in 6 seconds (4.5 with conscription as well). Since steppe husbandry only costs 200f/300w, you could theoretically have a single stable work as fast as 5 stables to produce light cavalry throughout the Castle Age if you go for kipchaks.</p>",
            "knight":"",
            "camel rider":"",
            "battle elephant":"",
            "battering ram":"",
            "mangonel":"",
            "scorpion":"",
            "fishing ship":"",
            "fire galley": "",
            "galley":"",
            "demolition ship":"",
            "house":""
            
        };
        let unitVariety = {
            "villager":{
                "upgrades":{
                    
                },
                "civs":{
                    "Indians - Dark Age":{
                        "cost": {"food": 45}
                    },
                    "Indians - Feudal Age":{
                        "cost": {"food": 40}
                    },
                    "Indians - Castle Age":{
                        "cost": {"food": 35}
                    },
                    "Indians - Imperial Age":{
                        "cost": {"food": 30}
                    },
                    "Persians - Dark Age":{
                        "trainTime": 23.8095238095
                    },
                    "Persians - Feudal Age":{
                        "trainTime": 22.7272727273
                    },
                    "Persians - Castle Age":{
                        "trainTime": 21.7391304348
                    },
                    "Persians - Imperial Age":{
                        "trainTime": 20.8333333333
                    }
                }
            },
            "militia":{
                "upgrades":{
                    "Supplies": {
                        "cost": {"food": -5}
                    }
                },
                "civs":{
                    "Goth Civ + Team Bonus": {
                        "cost": {"food": 39, "gold": 13},
                        "trainTime": 17.5
                    },
                    "Aztec Civ Bonus": {
                        "trainTime": 17.7966101695
                    }
                }
                        
            },
            "spearman":{
                "upgrades":{
                    
                },
                "civs":{
                    "Goth Civ + Team Bonus": {
                        "cost": {"food": 23, "wood": 16},
                        "trainTime": 18.3333333333
                    },
                    "Byzantines Civ Bonus":{
                        "cost": {"food": 26, "wood": 19}
                    },
                    "Aztec Civ Bonus": {
                        "trainTime": 18.6440677966
                    }
                }
            },
            "eagle scout":{
                "upgrades":{
                    "Castle Age":{
                        "trainTime": 35,
                        "img": "eagle warrior"
                    },
                    "Elite Eagle Warrior":{
                        "trainTime": 20,
                        "img": "elite eagle warrior"
                    },
                    "Conscription":{
                        "trainTime": 15.037593985,
                        "img": "elite eagle warrior"
                    }
                }
            },
            "archer":{
                "Mayans - Feudal Age":{
                    "cost": {"wood": 23, "gold": 41}
                },
                "Mayans - Castle Age":{
                    "cost": {"wood": 20, "gold": 36}
                },
                "Mayans - Imperial Age":{
                    "cost": {"wood": 18, "gold": 32}
                },
                "Koreans Civ Bonus": {
                    "cost": {"wood": 21, "gold": 45}
                },
                "Kamandaran":{
                    "cost": {"wood": 60}
                },
                "Aztec Civ Bonus":{
                    "trainTime": 29.6610169492
                }
            },
            "crossbowman":{
                "Mayans - Castle Age":{
                    "cost": {"wood": 20, "gold": 36}
                },
                "Mayans - Imperial Age":{
                    "cost": {"wood": 18, "gold": 32}
                },
                "Koreans Civ Bonus": {
                    "cost": {"wood": 21, "gold": 45}
                },
                "Kamandaran":{
                    "cost": {"wood": 60}
                },
                "Aztec Civ Bonus":{
                    "trainTime": 22.8813559322
                }
            },
            "scout cavalry":{
                "Berbers - Castle Age":{
                    "cost":{"food": 68}
                },
                "Berbers - Imperial Age":{
                    "cost":{"food": 64}
                },
                "Magyars Civ Bonus":{
                    "cost":{"food": 68}
                },
                "Chivalry":{
                    "trainTime": 21.4285714286
                },
                "Steppe Husbandry":{
                    "trainTime": 6
                }
            }
        };
        
        let vilsRequired = {};
        data.units.forEach(function(unit){
            vilsRequired[unit.name] = {
                res: getVilsRequired(unit.trainTime, unit.cost, 1)
            };
            vilsRequired[unit.name].img = unit.img || unit.name;
        });
        
        
        function getVilsRequired(trainTime, cost, multiplier){
            let req = {};
            for(let i in cost){
                let idx = resOrder.indexOf(i);
                let vilTypes = order[idx];
                for(let j = 0; j < vilTypes.length; j++){
                    req[vilTypes[j]] = (1 / (gatherRates[vilTypes[j]].gatherRate * trainTime / cost[i]) * multiplier);
                }
            }
            return req;
        }
        function changeMultiplier(e, num){
            let valCont = $(e.target).parent().children("div:eq(1)");
            let curNum = parseInt(valCont.text());
            curNum = Math.max(curNum + num, 1);
            valCont.text(curNum);
        }
        //When changing a select value, replace the container with a new one with the new values.
        function updateVilsRequired(e){
            let cont = $(e.target).closest(".unit-container");
            let upgrade = cont.children(".unit").children(".upgrade-cont").children("select").val();
            let unitName = cont.attr("name");
            let multiplier = parseInt(cont.children(".unit").children(".multiplier-cont").children("div:eq(1)").text());
            let unitData = finder(data.units, unitName);
            let reqData = vilsRequired[upgrade];
            //TODO: get civ upgrade as well as all applied upgrades.
            
            
            if(upgrade && upgrade !== "Generic"){
                unitVariety[unitName][upgrade].trainTime = unitVariety[unitName][upgrade].trainTime || unitData.trainTime;
                unitVariety[unitName][upgrade].cost = unitVariety[unitName][upgrade].cost || unitData.cost;
                vilsRequired[upgrade] = {
                    res: getVilsRequired(unitVariety[unitName][upgrade].trainTime, unitVariety[unitName][upgrade].cost, multiplier)
                };
                vilsRequired[upgrade].img = unitData.img || unitVariety[unitName][upgrade].img || unitName;
                
                reqData = vilsRequired[upgrade];
            } else {
                vilsRequired[unitName] = {
                    res: getVilsRequired(finder(data.units, unitName).trainTime, finder(data.units, unitName).cost, multiplier)
                };
                vilsRequired[unitName].img = unitData.img || unitName;
                
                upgrade = false;
                reqData = vilsRequired[unitName];
            }
            console.log(reqData)
            let replacement = getUnitContainer(unitName, reqData, multiplier, upgrade);
            if(replacement){
                cont.replaceWith(replacement);
            }
        }
        function getUnitContainer(name, unitData, multiplier, selectOption){
            if(unitData){
                let cont = $("<div class='unit-container' name='"+name+"' ></div>");
                let unitCont = $("<div class='unit'></div>");
                let cost = selectOption ? unitVariety[name][selectOption].cost : finder(data.units, name).cost;
                let trainTime = selectOption ? unitVariety[name][selectOption].trainTime : finder(data.units, name).trainTime;
                for(let i in cost){
                    unitCont.append("<div class='res-cont'><img src='img/"+i+"-icon.png'><div>"+cost[i]+"</div></div>");
                }
                unitCont.append("<div class='res-cont'><img src='img/hourglass-icon.png'><div>"+parseFloat( trainTime.toFixed(2) )+"</div></div>");
                
                unitCont.append("<div><img src='img/"+unitData.img+".png' title='"+name+"'></div>");
                //Add all relevant upgrades
                if(unitVariety[name]){
                    let selectCont = $("<div class='upgrade-cont'></div>");
                    let upgradeSelect = $("<select><option>Generic</option></select>");
                    for(let j in unitVariety[name].civs){
                        if(selectOption === j){
                            upgradeSelect.append("<option selected>"+j+"</option>");
                        } else {
                            upgradeSelect.append("<option>"+j+"</option>");
                        }
                    }
                    selectCont.append(upgradeSelect);
                    unitCont.append(selectCont);
                    upgradeSelect.on("change", updateVilsRequired);
                }
                let multiplierCont = $("<div class='multiplier-cont'></div>");
                let minus = $("<div>-</div>");
                let num = $("<div>"+multiplier+"</div>");
                let plus = $("<div>+</div>");
                minus.on("click", function(e){
                    changeMultiplier(e, -1);
                    updateVilsRequired(e);
                });
                plus.on("click", function(e){
                    changeMultiplier(e, 1);
                    updateVilsRequired(e);
                });
                multiplierCont.append(minus, num, plus);
                unitCont.append(multiplierCont);
                cont.append(unitCont);
                
                let resAndTextCont = $("<div class='res-desc-cont'></div>");
                let resourcesCont = $("<div class='resources-cont'></div>");
                let upgradesCont = $("<div class='upgrades-cont'></div>");
                let textCont = $("<div class='unit-desc-cont'>"+(unitDescs[name] || "")+"</div>");
                for(let j in unitData.res){
                    if(noShow.indexOf(j) < 0){
                        resourcesCont.append("<div class='resource'><img class='icon-big' src='img/"+j+".png' title='"+j+"'><div class='resource-num'><div title='"+unitData.res[j]+"'>"+Math.ceil(unitData.res[j])+"</div></div></div>");
                    }
                }
                if(unitVariety[name]){
                    for(let j in unitVariety[name].upgrades){
                        upgradesCont.append("<div><div>"+j+"</div><input type='checkbox'></div>");
                    }
                }
                
                resAndTextCont.append(resourcesCont);
                resAndTextCont.append(upgradesCont);
                resAndTextCont.append(textCont);;
                cont.append(resAndTextCont);
                return cont;
            }
        }
        for(let i = 0; i < unitsShown.length; i++){
            let cont = getUnitContainer(unitsShown[i], vilsRequired[unitsShown[i]], 1);
            if(cont){
                gatherRatesCont.append(cont);
            }
        }
        $("#container").append(gatherRatesCont);
        console.log(vilsRequired)
        console.log(data.units)
    });
});