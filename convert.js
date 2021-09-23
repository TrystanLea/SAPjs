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

    $.getJSON( "openBEM/blank.json?v=1", function( result ) {
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
        }
        
        callback(sap);
    });
}
