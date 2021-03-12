var data = {};

$.getJSON( "openBEM/example.json", function( result ) {

    data = result

    data.fabric.library = {
      "Stone wall": {"type":"wall", "uvalue":1.7, "kvalue":150},
      "Party wall": {"type":"party_wall", "uvalue":0.0, "kvalue":150},
      "Insulated floor": {"type":"floor", "uvalue":0.38, "kvalue":110},
      "Solid floor": {"type":"floor", "uvalue":0.9, "kvalue":110},
      "Insulated loft": {"type":"loft", "uvalue":0.18, "kvalue":9},
      "Double Glazing": {"type":"window", "uvalue":3.1, "kvalue":0, "g":0.76, "gL":0.8, "ff":0.7}
    }
    
    convert_to_openbem()
    data = calc.run(data)
    
    // ---------------------------------------------------------------
    // Vue App
    // ---------------------------------------------------------------
    var app = new Vue({
      el: '#sap',
      data: {
        data: data,
        datasets: datasets
      },
      // -------------------------------------------------------------
      // Methods
      // -------------------------------------------------------------
      methods: {
        update: function () {
          convert_to_openbem()
          this.data = calc.run(this.data)
          draw_openbem_graphics('#topgraphic');
        },
        // Floors
        addFloor: function () {
          this.data.floors.push({name:"New Floor", area:0, height:0})
          this.update()
        },
        deleteFloor: function (index) {
          this.data.floors.splice(index,1)
          this.update()
        },
        addIVF: function(){},
        addEVP: function(){},
        toggleSection: function (roomName) {
            $(".room-elements[name="+roomName+"]").slideToggle(); 
        }
      },
      // -------------------------------------------------------------
      // Filters
      // -------------------------------------------------------------
      filters: {
        toFixed: function(val,dp) {
          return val.toFixed(dp)
        }
      }
    });

    $.ajax({
        url: 'topgraphic/topgraphic.html',
        cache: true,
        success: function(result) {
            $('#topgraphic').html(result);
            app.update()
        }               
    });
});

function convert_to_openbem() {
    for (var z in data.fabric.elements) {
        if (data.fabric.elements[z].lib!=undefined) {
            if (data.fabric.library[data.fabric.elements[z].lib]!=undefined) {
                var lib = data.fabric.library[data.fabric.elements[z].lib]
                for (var p in lib) data.fabric.elements[z][p] = lib[p]
            }
        }
    }
}
