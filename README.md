# SAPjs

Minimal user interface for the OpenBEM SAP model using Vue.js

![SAPjs.png](SAPjs.png)

### Online tool

SAPjs is installed on the OpenEnergyMonitor server for public use here:

**https://openenergymonitor.org/sapjs/**

Save and open projects to your computer locally. Data is not stored on the OpenEnergyMonitor server, all calculations happen in your computer browser.
The OpenEnergyMonitor server is only used to initially load the tool.

### Self host or install locally

1\. Clone this repository into your public_html folder (assuming installed apache2 server):

    git clone https://github.com/TrystanLea/SAPjs
    
2\. Clone my fork of the OpenBEM SAP model inside the SAPjs directory:

    cd SAPjs
    git clone https://github.com/TrystanLea/openBEM
    
 3\. Thats it, open in browser via e.g: http://localhost/SAPjs
    
