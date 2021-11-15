if (window.location.search=="?load=heatlossjs") {
    setTimeout(function(){
        var data_str = localStorage.getItem("heatlossjs");
        if (data_str) {
            var heatlossjsdata = JSON.parse(localStorage.getItem("heatlossjs"));
            localStorage.removeItem('heatlossjs');
            convert_heatlossjs_to_sapjs(heatlossjsdata,function(sap){
                app.data = Object.assign(app.data,sap) 
                app.update()
            });
        }
    },100);
}

function convert_heatlossjs_to_sapjs(heatlossjsdata,callback) {

    $.getJSON( "openBEM/blank.json?v=2", function( result ) {
        var sap = result;
        sap.fabric.library = {}
        
        for (var name in heatlossjsdata.element_type) {

            if (name.toLowerCase().includes("loft")) {
                sap.fabric.library[name] = {
                    type: "loft",
                    uvalue: heatlossjsdata.element_type[name].uvalue,
                    kvalue: 50 
                }
            }
            else if (name.toLowerCase().includes("floor")) {
                sap.fabric.library[name] = {
                    type: "floor",
                    uvalue: heatlossjsdata.element_type[name].uvalue,
                    kvalue: 110 
                }
            }
            else if (name.toLowerCase().includes("wall")) {
                sap.fabric.library[name] = {
                    type: "wall",
                    uvalue: heatlossjsdata.element_type[name].uvalue,
                    kvalue: 150 
                }
            }
            else if (name.toLowerCase().includes("glazing") || name.toLowerCase().includes("window") || name.toLowerCase().includes("door")) {
                sap.fabric.library[name] = {
                    type: "window",
                    uvalue: heatlossjsdata.element_type[name].uvalue,
                    kvalue: 0,
                    g: 0.76,
                    gL: 0.8,
                    ff: 0.7
                }
            }
            else {
                sap.fabric.library[name] = {
                    type: "wall",
                    uvalue: heatlossjsdata.element_type[name].uvalue,
                    kvalue: 150 
                }
            }
        }
        
        var id = 1;
        
        var total_floor_area = 0;
        var total_volume = 0;

        for (var room in heatlossjsdata.rooms) {
            for (var elementIndex in heatlossjsdata.rooms[room].elements) {
                var element = heatlossjsdata.rooms[room].elements[elementIndex];
            
                var room_ucfirst = room && room[0].toUpperCase() + room.slice(1);
            
                if (element.boundary=="external" || element.boundary=="ground" || element.boundary=="unheated") {
                    sap.fabric.elements.push({
                        "id": room_ucfirst+" "+element.orientation+" e"+elementIndex,
                        "lib": element.type,
                        "l": element.width,
                        "h": element.height
                    });
                }
                id ++;
            }
            
            total_floor_area += heatlossjsdata.rooms[room].area;
            total_volume += heatlossjsdata.rooms[room].volume;
        }
        
        sap.floors = [
            {
              "name": "Combined floor",
              "area": total_floor_area,
              "height": 1*(total_volume / total_floor_area).toFixed(2)
            }
        ];
        
        // Populate a default heating system
        sap.heating_systems = [
            {
                "name": "Heat pump",
                "provides": "heating_and_water",
                "instantaneous_water_heating": false,
                "main_space_heating_system": "mainHS1",
                "fraction_water_heating": 1,
                "fraction_space": 1,
                "summer_efficiency": 350,
                "winter_efficiency": 400,
                "fuel": "Electricity",
                "responsiveness": 1,
                "heating_controls": 2,
                "temperature_adjustment": 0,
                "primary_circuit_loss": true,
                "central_heating_pump": 0,
                "central_heating_pump_inside": true,
                "warm_air_system": false,
                "fans_and_supply_pumps": 0,
                "sfp": 0,
                "combi_loss": 0
            }
        ];  
        
        callback(sap);
    });
}
