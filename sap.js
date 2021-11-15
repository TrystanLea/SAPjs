var data = {};
var app = false;

$.getJSON( "openBEM/example.json?v=4", function( result ) {

    data = result
    data = calc.run(data)
    
    if (data.project_name==undefined) data.project_name = "myproject";
    
    // ---------------------------------------------------------------
    // Vue App
    // ---------------------------------------------------------------
    app = new Vue({
      el: '#sap',
      data: {
        data: data,
        datasets: datasets,
        tmp: {
          new_element_type_name: "",
          new_fuel_type_name: ""
        }
      },
      // -------------------------------------------------------------
      // Methods
      // -------------------------------------------------------------
      methods: {
        update: function () {
          this.data = calc.run(this.data)
          draw_openbem_graphics('#topgraphic');
        },
        update_hoursoff: function () {
          if (typeof data.temperature.hours_off.weekday === 'string') {
              data.temperature.hours_off.weekday = data.temperature.hours_off.weekday.split(',').map(Number)
          }
          if (typeof data.temperature.hours_off.weekend === 'string') {
              data.temperature.hours_off.weekend = data.temperature.hours_off.weekend.split(',').map(Number)
          }
          this.update()
        },
        // -----------------------------------------------------------
        // Floors
        // -----------------------------------------------------------
        addFloor: function () {
          this.data.floors.push({name:"New Floor", area:0, height:0})
          this.update()
        },
        deleteFloor: function (index) {
          this.data.floors.splice(index,1)
          this.update()
        },
        // -----------------------------------------------------------
        // Fabric
        // -----------------------------------------------------------
        addFabricLibraryItem: function() {
            
            var keys = Object.keys(data.fabric.library);
            if (keys.length) {
                next = JSON.parse(JSON.stringify(data.fabric.library[keys[keys.length-1]]))
            } else {
                next = {"type":"wall", "uvalue":0.3, "kvalue":75}
            }
            data.fabric.library[this.tmp.new_element_type_name] = next
            this.tmp.new_element_type_name = ""
            this.update()
        },
        deleteFabricLibraryItem: function(key) {
          delete this.data.fabric.library[key]
          this.update()
        },
        addFabricElement: function() {
          if (this.data.fabric.elements.length) {
              next = JSON.parse(JSON.stringify(this.data.fabric.elements[this.data.fabric.elements.length-1]))
              next.id += " (copy)"
              this.data.fabric.elements.push(next)
          } else {
              var keys = Object.keys(data.fabric.library);
              if (keys.length) {
                  next = {"id":"", "lib":keys[0], "l":0, "h":0 }
                  this.data.fabric.elements.push(next)
              }
          }
          this.update()
        },
        deleteFabricElement: function(index) {
          this.data.fabric.elements.splice(index,1)
          this.update()
        },
        // -----------------------------------------------------------
        // Ventilation
        // -----------------------------------------------------------
        addIVF: function(){
          this.data.ventilation.IVF.push({name:"",ventilation_rate:0})
          this.update()
        },
        deleteIVF: function (index) {
          this.data.ventilation.IVF.splice(index,1)
          this.update()
        },        
        addEVP: function(){
          this.data.ventilation.EVP.push({name:"",ventilation_rate:0})
          this.update() 
        },
        deleteEVP: function (index) {
          this.data.ventilation.EVP.splice(index,1)
          this.update()
        },  
        // -----------------------------------------------------------
        // Heating systems
        // -----------------------------------------------------------
        addHeatingSystem: function () {
          this.data.heating_systems.push({
            "name":"Heat pump",
            "provides":"heating_and_water",
            "instantaneous_water_heating":false,
            "main_space_heating_system": "mainHS1", 
            "fraction_water_heating": 1.0, 
            "fraction_space": 1.0,
            "summer_efficiency": 350,
            "winter_efficiency": 400,
            "fuel": "Standard Tariff",
            "responsiveness":1,
            "heating_controls":2,
            "temperature_adjustment":0,
            "primary_circuit_loss":true,
            "central_heating_pump":0,
            "central_heating_pump_inside":true,
            "warm_air_system":false,           
            "fans_and_supply_pumps":0,
            "sfp":0,
            "combi_loss":0
          })
          this.update()
        },
        deleteHeatingSystem: function (index) {
          this.data.heating_systems.splice(index,1)
          this.update()
        },
        // -----------------------------------------------------------
        // Lighting, Appliances and Cooking
        // -----------------------------------------------------------
        addLACitem: function () {
          this.data.appliancelist.list.push({
            "category": "lighting",
            "name": "LED Light", 
            "power": 0, 
            "hours": 0,
            "kwhd": 0,
            "kwhy": 0,
            "fuel": "Standard Tariff", 
            "efficiency": 100
          });
          this.update()
        },
        deleteLACitem: function (index) {
          this.data.appliancelist.list.splice(index,1)
          this.update()
        },
        // -----------------------------------------------------------
        // Add and remove fuel
        // -----------------------------------------------------------
        addFuel: function () {
            data.fuels[this.tmp.new_fuel_type_name] = {
                standingcharge: 0, 
                fuelcost: 0.0, 
                co2factor: 0.0, 
                primaryenergyfactor: 1.0 
            }
            this.tmp.new_fuel_type_name = ""
            this.update()
        },
        deleteFuel: function (index) {
          // Check if fuel is in use
          for (var z in data.fuel_totals) {
             if (data.fuel_totals[z].name==index) {
               alert("Fuel is in use, cannot remove");
               return false;
             }
          }
          delete data.fuels[index]
          this.update()
        },
        toggleSection: function (roomName) {
            $(".room-elements[name="+roomName+"]").slideToggle(); 
        }
      },
      // -------------------------------------------------------------
      // Filters
      // -------------------------------------------------------------
      filters: {
        toFixed: function(val,dp) {
          if (isNaN(val)) {
              return val;
          } else {
              return val.toFixed(dp)
          }
        }
      }
    });

    $.ajax({
        url: 'topgraphic/topgraphic.html?v=3',
        cache: true,
        success: function(result) {
            $('#topgraphic').html(result);
            app.update()
        }               
    });
});

$(".save").click(function(){
    var date = new Date();
    var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    var h = date.getHours();
    if (h<10) h = "0"+h;
    var m = date.getMinutes();
    if (m<10) m = "0"+m; 
    var datestr = date.getDate()+months[date.getMonth()]+h+m
    download_data("sapjs_"+app.data.project_name+"_"+datestr+".json",JSON.stringify(app.data, null, 2))
});

$("#open").change(function(e){
    open_file(e)
});

$(".new").click(function(e){
    $.getJSON( "openBEM/blank.json?v=5", function( result ) {
        result = calc.run(result)
        app.data = Object.assign(app.data,result) 
        app.update()
    });
});

function open_file(e) {
  var file = e.target.files[0];
  if (!file) {
    return;
  }
  var reader = new FileReader();
  reader.onload = function(e) {
    var contents = JSON.parse(e.target.result);
    if (contents!=null) {
        app.data = Object.assign(app.data,contents) 
        app.update()
    }
  };
  reader.readAsText(file);
}

function download_data(filename, data) {
    var blob = new Blob([data], {type: 'application/json'});
    if(window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveBlob(blob, filename);
    }
    else{
        var elem = window.document.createElement('a');
        elem.href = window.URL.createObjectURL(blob);
        elem.download = filename;        
        document.body.appendChild(elem);
        elem.click();        
        document.body.removeChild(elem);
    }
}
