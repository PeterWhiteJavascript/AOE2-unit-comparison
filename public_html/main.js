$(function(){
    $.getJSON('data.json', function(data) {
        let units = data.units;
        let upgrades = data.upgrades;
        //Add age up upgrades from units (+2 attack to sc etc...)
        let agesStrings = ["feudal age", "castle age", "imperial age"];
        for(let i = 0; i < units.length; i++){
            //We're just doing damage test right now, so use damageTechs
            units[i].techs = units[i].damageTechs;//can go .concat(units[i].otherTechs) for all techs;
            
            let ageUpgrade = units[i].ageUpgrade;
            if(ageUpgrade){
                for(let j = 0; j < ageUpgrade.length; j++){
                    upgrades.push({
                        name: agesStrings[j] + " " + units[i].name,
                        effects: ageUpgrade[j],
                        ageReq: j + 2
                    });
                    
                }
            }
        }
        
        let unitGrid = data.unitGrid;
        let upgradeGroups = data.upgradeGroups;
        //Stores the attack/defender stats.
        let combats = [];
        
        function finder(arr, name){
            return arr.find((e) => {return e.name === name;});
        }
        function switchCombatants(){
            let elm = $(this);
            let idxI = $("#combatants").children(".combat-cont").index(elm.closest('.combat-cont')[0]);
            let tempData = combats[idxI][0];
            combats[idxI][0] = combats[idxI][1];
            combats[idxI][1] = tempData;
            // create a temporary marker div
            let atkElm = elm.closest('.combat-cont').children(".combatant:eq(0)");
            let defElm = elm.closest('.combat-cont').children(".combatant:eq(1)");
            var aNext = $('<div>').insertAfter(atkElm);
            atkElm.insertAfter(defElm);
            defElm.insertBefore(aNext);
            aNext.remove();
            atkElm.children(".combatant-title").children("h3").text("Defender");
            defElm.children(".combatant-title").children("h3").text("Attacker");
            atkElm.siblings(".combat-result").replaceWith(generateResult(combats[idxI][0], combats[idxI][1]));
        }
        function getCombatantData(elm){
            let idxI = $("#combatants").children(".combat-cont").index(elm.closest('.combat-cont')[0]);
            let idxJ = $("#combatants").children(".combat-cont:eq("+idxI+")").children(".combatant").index(elm.closest('.combatant')[0]);
            return {combatant: combats[idxI][idxJ], idx: [idxI, idxJ], combatants: combats[idxI]};
        }
        function displayUnitGrid(){
            function removeGrid(){
                grid.remove();
                $(this).unbind('mouseup');
            }
            let portrait = $(this);
            let grid = $("<div class='unit-selection-grid'></div>");
            let sectionNum = 0;
            let sectionHeight = 9;
            let section = $("<div class='unit-selection-grid-section'></div>");
            for(let i = 0; i < unitGrid.length; i++){
                let row = $("<div></div>");
                for(let j = 0; j < unitGrid[i].length; j++){
                    let img = $('<img class="icon-big" unit="'+unitGrid[i][j]+'" src="img/'+unitGrid[i][j]+'.png">');
                    img.on("mousedown", function(){
                        let unitClassNum = grid.children(".unit-selection-grid-section").children("div").index($(this).parent());
                        let unit = units.find((d) => {return d.name === unitGrid[unitClassNum][0];});
                        let unitUpgrade = $(this).parent().children("img").index(this);
                        let replacing = portrait.closest(".combatant");
                        
                        
                        let combatant = createCombatant(replacing.children(".combatant-title").children("h3").text(), unit);
                        let combatIdx = $("#combatants").children(".combat-cont").index(replacing.closest(".combat-cont"));
                        let combatantIdx = replacing.parent().children(".combatant").index(replacing);
                        combats[combatIdx][combatantIdx] = combatant.data;
                        
                        replacing.siblings(".combat-result").replaceWith(generateResult(combats[combatIdx][0], combats[combatIdx][1]));
                        replacing.replaceWith(combatant.element);
                        //Apply the class upgrade if there is one.
                        if(unitUpgrade){
                            $(combatant.element).children(".combatant-props").children("div:eq(1)").children(".upgrades").children("div:eq(0)").children(".icon:eq("+(unitUpgrade-1)+")").click();
                        }
                        removeGrid();
                    });
            
                    row.append(img);
                }
                section.append(row);
                sectionNum++;
                if(sectionNum === sectionHeight){
                    grid.append(section);
                    section = $("<div class='unit-selection-grid-section'></div>");
                    sectionNum = 0;
                }
            }
            grid.append(section);
            
            $(document.body).append(grid);
            $(document.body).mouseup(removeGrid);
        }
        
        function applyUpgrade(force){
            function applyEffect(key, data){
                if(key === "cost"){
                    unitData.cost[data[key[0]]] += data[key][1] * locked;
                    let statConts = elm.closest(".combatant-props").children(".combatant-stats").children("div:eq(0)").children(".stat-cont");
                    statConts.each((idx, elm) => {
                        if($(elm).attr("stat") === data[key][0]) $(elm).children(".stat").text(unitData.cost[ data[i][0]]);
                    });
                } else if(key === "bonus"){
                    for(let x = 0; x < unitData.bonus.length; x++){
                        for(let y = 0; y < data[key].length; y++){
                            if(unitData.bonus[x][0] === data[key][y][0]){
                                unitData.bonus[x][1] += data[key][y][1] * locked;
                            }
                        }
                    }
                } else {
                    unitData[key] += data[key] * locked;
                    let statConts = elm.closest(".combatant-props").children(".combatant-stats").children("div:eq(3)").children(".unit-stats").children(".stat-cont");
                    statConts.each((idx, elm) => {
                        if($(elm).attr("stat") === key) $(elm).children(".stat").text(unitData[key]);
                    });
                }
            }
            let elm = $(this);
            let locked = $(this).hasClass("upgrade-locked") ? 1 : -1;
            if(force + locked === 0) return;
            let upgradeData = finder(upgrades, elm.attr("upgrade"));
            let combatantData = getCombatantData(elm);
            let unitData = combatantData.combatant;
            
            if(upgradeData && locked !== -1){
                //If the clicked upgrade age req is greater than the current age, force the correct age.
                let ageReqIcon = elm.closest(".combatant-props").children(".combatant-stats").children("div:eq(0)").children(".icon:eq("+(upgradeData.ageReq - 1)+")");
                if(!elm.closest(".combatant-props").children(".combatant-stats").children("div:eq(0)").is(elm.parent()) && ageReqIcon.hasClass("upgrade-locked")){
                    changeAge.call(ageReqIcon);
                }
            }
            
            //Figure out if any prerequesite upgrades are still locked and unlock them.
            let thisIdx = elm.parent().children("img").index(elm);
            let maxIdx = elm.parent().children("img").length - 1;
            
            let unlocked = elm.parent().children("img").not(".upgrade-locked");
            
            //If the upgrade is being unlocked
            if(locked > 0 && thisIdx > 0){
                applyUpgrade.call(elm.parent().children("img:eq("+(thisIdx - 1)+")"), locked);
            } 
            //If the upgrade is being locked
            else if(locked < 0 && thisIdx < maxIdx){
                applyUpgrade.call(elm.parent().children("img:eq("+(thisIdx + 1)+")"), locked);
                //Make sure to only remove the upgrade if it's the final one applied in the group.
                if(!$(unlocked[unlocked.length - 1]).is(this) && !Number.isInteger(force)){
                    return;
                }
                
            }
            
            $(this).toggleClass("upgrade-locked");
            
            if(upgradeData){
                //If the portait changes
                let portraitCont = elm.closest(".combatant-props").children(".combatant-stats").children("div:eq(1)").children(".icon-big");
                if(upgradeData.classChange){
                    if(locked > 0){
                        portraitCont[0].src = "img/" + upgradeData.name + ".png";
                    } else {
                        let unlocked = elm.closest(".upgrades").children("div:eq(0)").children("img").not(".upgrade-locked");
                        let name = $(unlocked[unlocked.length - 1]).attr("upgrade") || unitData.name;
                        portraitCont[0].src = "img/" + name  + ".png";
                    }
                }
                
                //Add/Remove each of the effects
                for(let i in upgradeData.effects){
                    //Apply the unit specific effects as well.
                    if(i === "unitSpec"){
                        let effects = upgradeData.effects[i][unitData.name];
                        for(j in effects){
                            applyEffect(j, effects);
                        }
                    } else {
                        applyEffect(i, upgradeData.effects);
                    }
                    
                    
                }
                //If we're adding the effect
                if(locked === 1){
                    upgradeData.element = this;
                    unitData.activeUpgrades.push(upgradeData);
                } 
                //If we're removing the effect
                else {
                    //Find and remove the upgrade.
                    for(let i = unitData.activeUpgrades.length - 1; i >= 0; i--){
                        if(unitData.activeUpgrades[i].name === upgradeData.name){
                            unitData.activeUpgrades.splice(i, 1);
                        }
                    }
                }
            }
            
            //Display the results
            let attacker, defender;
            //If our guy is odd, then he is the defender
            if((combatantData.idx[1] % 2) === 1) {
                defender = unitData;
                attacker = combats[combatantData.idx[0]][combatantData.idx[1] - 1];
            } else {
                defender = combats[combatantData.idx[0]][combatantData.idx[1] + 1];
                attacker = unitData;
            }
            elm.closest(".combat-cont").children(".combat-result").replaceWith(generateResult(attacker, defender));
        }
        function generateResult(attacker, defender){
            let type = attacker.atkType;
            let defenderDef = type === "melee" ? defender.mDef : defender.pDef;
            let bonusDamage = 0;
            let elevationBonus = attacker.elevation > defender.elevation ? 1.25 : attacker.elevation < defender.elevation ? 0.75 : 1;// 0.75, 1, or 1.25
            let attackerBonus = attacker.bonus; 
            let defenderArmor = defender.armorClasses;
            for(let i = 0; i < attackerBonus.length; i++){
                for(let j = 0; j < defenderArmor.length; j++){
                    if(attackerBonus[i][0] === defenderArmor[j][0]) bonusDamage += attackerBonus[i][1] - defenderArmor[j][1];
                }
            }
            
            
            let dmgPerHit = Math.max(1, attacker.atk - defenderDef);
            let dmgWithBonus = Math.max(1, (dmgPerHit + bonusDamage) * elevationBonus);
            let numHitsToKill = Math.ceil(defender.hp / dmgWithBonus);
            let overkill = defender.hp % dmgWithBonus;
            let elm = $('<div class="combat-result">\n\
                    <h3>Result</h3>\n\
                    <div class="combat-results">\n\
                        <div class="stat-title">Bonus Damage</div>\n\
                        <div class="stat">'+bonusDamage+'</div>\n\
                        <div class="stat-title">Elevation Multiplier</div>\n\
                        <div class="stat">'+elevationBonus+'</div>\n\
                        <div class="stat-title">Damage per Hit</div>\n\
                        <div class="stat">'+dmgWithBonus+'</div>\n\
                        <div class="stat-title">Hits to Kill</div>\n\
                        <div class="stat">'+numHitsToKill+'</div>\n\
                        <div class="stat-title">Overkill Amount</div>\n\
                        <div class="stat">'+overkill+'</div>\n\
                    </div>\n\
                </div>');
            let switchButton = $("<div class='switch-button button'>Swap Combatants</div>");
            switchButton.on("click", switchCombatants);
            $(elm).append(switchButton);
            return elm;
        }
        function getUpgrades(data){
            let upgradeData = [];
            let elm = $('<div><div class="upgrades"></div></div>');
            //Find the upgrade data.
            let techData = [];
            for(let i = 0; i < data.techs.length; i++){
                let upgradeData = finder(upgrades, data.techs[i]);
                if(!upgradeData){
                    upgradeData = upgradeGroups[data.techs[i]];
                    let group = [];
                    for(let j = 0; j < upgradeData.length; j++){
                        group.push(finder(upgrades, upgradeData[j]));
                    }
                    techData.push(group);
                } else {
                    techData.push([upgradeData]);
                }
            }
            
            //Display the data
            for(let i = 0; i < techData.length; i++){
                let upgrade = $("<div></div>");
                for(let j = 0; j < techData[i].length; j++){
                    let name = techData[i][j].img ? techData[i][j].img : techData[i][j].name;
                    let icon = $('<img class="icon upgrade-icon upgrade-locked" src="img/'+name+'.png" upgrade="'+techData[i][j].name+'">');
                    upgrade.append(icon);
                    icon.click(applyUpgrade);
                }
                elm.children(".upgrades").append(upgrade);
            }
            return {element: elm, data: upgradeData};
        }
        function changeAge(){
            let elm = $(this);
            applyUpgrade.call(elm);
            
            //Remove any upgrades that are above the current age.
            let ages = elm.closest(".combatant-props").children(".combatant-stats").children("div:eq(0)");
            let currentAge = ages.children(".icon").not(".upgrade-locked").length;
            let combatant = getCombatantData(elm).combatant;
            for(let i = combatant.activeUpgrades.length - 1; i >= 0; i--){
                let up = combatant.activeUpgrades[i];
                if(up.ageReq > currentAge){
                    applyUpgrade.call(up.element, -1);
                }
            }
            
        }
        function createCombatant(title, data){
            function createStatCont(name, id, data){
                let elm = 
                    '<div class="stat-cont" stat="'+id+'">\n\
                        <div class="stat-title">'+name+'</div>\n\
                        <div class="stat">'+data[id]+'</div>\n\
                    </div>';
                return elm;
            };
            let combatantData = $.extend({}, data);
            combatantData.bonus = combatantData.bonus.map(a => Object.assign({}, a));
            combatantData.elevation = 1;
            combatantData.activeUpgrades = [];
            let element = 
                    $('<div class="combatant">\n\
                        <div class="combatant-title"><h3>'+title+'</h3></div>\n\
                        <div class="combatant-props">\n\
                            <div class="combatant-stats"></div>\n\
                        </div>\n\
                    </div>');
            let ages = $('<div>\n\
                            <img class="icon upgrade-icon upgrade-locked" src="img/dark age.png">\n\
                            <img class="icon upgrade-icon upgrade-locked" src="img/feudal age.png" upgrade="feudal age '+combatantData.name+'">\n\
                            <img class="icon upgrade-icon upgrade-locked" src="img/castle age.png" upgrade="castle age '+combatantData.name+'">\n\
                            <img class="icon upgrade-icon upgrade-locked" src="img/imperial age.png" upgrade="imperial age '+combatantData.name+'">\n\
                        </div>');;
            ages.children(".icon").click(changeAge);
            for(let i = 0; i < combatantData.ageReq; i++){
                ages.children(".icon:eq("+(i)+")").removeClass("upgrade-locked");
            }
            
            let elevationCont = $("<div><img class='icon icon-elevation upgrade-locked' src='img/elevation low.png'><img class='icon icon-elevation' src='img/elevation neutral.png'><img class='icon icon-elevation upgrade-locked' src='img/elevation high.png'></div>");
            elevationCont.children(".icon").click(function(){
                if($(this).hasClass("upgrade-locked")){
                    $(this).parent().children(".icon").addClass("upgrade-locked");
                    $(this).removeClass("upgrade-locked");
                    let thisIdx = $(this).parent().children(".icon").index($(this));
                    combatantData.elevation = thisIdx;
                    let combatants = getCombatantData($(this)).combatants;
                    $(this).closest(".combatant").siblings(".combat-result").replaceWith(generateResult(combatants[0], combatants[1]));
                }
            });
            let img =   '<div>\n\
                            <img class="icon-big" src="img/'+data.name+'.png">\n\
                        </div>';
            let unitStats = 
                    '<div>\n\
                        <div class="unit-stats">'+
                        createStatCont("Hit Points", "hp", data)+
                        createStatCont("Attack", "atk", data)+
                        createStatCont("Melee Armor", "mDef", data)+
                        createStatCont("Pierce Armor", "pDef", data)+
                        /*createStatCont("Range", "range", data)+
                        createStatCont("ATK Type", "atkType", data)+
                        createStatCont("Speed", "speed", data)+
                        createStatCont("Line of Sight", "lineOfSight", data)+
                        createStatCont("Rate of Fire", "rateOfFire", data)*/
                        '</div>\n\
                    </div>';

            element.children(".combatant-props").children("div:eq(0)").append(ages, img, elevationCont, unitStats);
            element.children(".combatant-props").children(".combatant-stats").children("div:eq(1)").children(".icon-big").click(displayUnitGrid);
            let upgradeData = getUpgrades(data);
            combatantData.upgrades = upgradeData.data;
            element.children(".combatant-props").append(upgradeData.element);
            /*
            for(let i in data.cost){
                element.children(".combatant-props").children("div:eq(0)").children("div:eq(3)").children(".unit-stats").append(createStatCont(i, i, data.cost));
            }
            element.children(".combatant-props").children("div:eq(0)").children("div:eq(3)").children(".unit-stats").append(createStatCont("Train Time", "trainTime", data));
            */
            return {element:element, data: combatantData};
        }
        
        $("#add-combat").click(() => {
            let combat = [];
            let cont = $("<div class='combat-cont'></div>");
            let attacker = createCombatant("Attacker", units[0]);
            let defender = createCombatant("Defender", units[0]);
            combat.push(attacker.data, defender.data);
            let result = generateResult(attacker.data, defender.data);
            cont.append(attacker.element, result, defender.element);
            $("#combatants").append(cont);
            combats.push(combat);
        });
         $("#add-combat").click();
    });




});