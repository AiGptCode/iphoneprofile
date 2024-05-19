const configForm = document.getElementById('config-form');

configForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  // Collect form data
  const formData = new FormData(configForm);

  // Determine the APN to use based on the apn_option parameter
  let apn = formData.get('apn') || '';
  if (formData.get('apn_option') === 'hamrahaval') {
    apn = 'mcinet';
  } else if (formData.get('apn_option') === 'irancell') {
    apn = 'irancelmci';
  } else if (formData.get('apn_option') === 'rightel') {
    apn = 'right';
  }

  // Create the configuration profile dictionary
  const configDict = {
    "PayloadContent": [],
    "PayloadDisplayName": "Cellular and Network Settings",
    "PayloadIdentifier": "com.example.cellular.config",
    "PayloadOrganization": "Example Inc.",
    "PayloadRemovalDisallowed": false,
    "PayloadType": "Configuration",
    "PayloadUUID": uuidv4(),
    "PayloadVersion": 1
  };

  // Create the cellular payload dictionary
  const cellularDict = {
    "PayloadDisplayName": "Cellular",
    "PayloadIdentifier": uuidv4(),
    "PayloadType": "com.apple.cellular",
    "PayloadUUID": uuidv4(),
    "PayloadVersion": 1,
    "APNs": [
      {
        "AuthenticationType": formData.get('carrier') === 'mcinet' ? "CHAP" : "PAP",
        "Enabled": true,
        "Name": apn
      }
    ],
    "SignalBoostEnabled": true,
    "APNSelectionMode": "Automatic"  // Set the APN to automatic
  };

  // Add the cellular payload to the configuration profile
  configDict["PayloadContent"].push(cellularDict);

  // Create the VPN payload dictionary if VPN server is provided and VPN is enabled
  const vpnServer = formData.get('vpn_server') || '';
  const vpnEnabled = formData.get('vpn-toggle') !== null;
  if (vpnEnabled && vpnServer) {
    const vpnDict = {
      "PayloadDisplayName": "VPN",
      "PayloadIdentifier": uuidv4(),
      "PayloadType": "com.apple.vpn.managed",
      "PayloadUUID": uuidv4(),
      "PayloadVersion": 1,
      "AuthenticationMethod": "Certificate",
      "DisconnectOnLogout": true,
      "DisconnectOnSleep": true,
      "SendAllTraffic": true,
      "ServerAddress": vpnServer,
      "ServerPort": 1723,
      "Protocol": "L2TP",
      "SharedSecret": "YourSharedSecret",
      "Username": formData.get('vpn_username') || "YourUsername",
      "Password": formData.get('vpn_password') || "YourPassword"
    };

    // Add the VPN payload to the configuration profile
    configDict["PayloadContent"].push(vpnDict);

    // Create the on-demand VPN payload dictionary if Cloudflare domain is provided and Cloudflare is enabled
    const cloudflareDomain = formData.get('cloudflare_domain') || '';
    const cloudflareEnabled = formData.get('cloudflare-toggle') !== null;
    if (cloudflareEnabled && cloudflareDomain) {
      const onDemandVpnDict = {
        "PayloadDisplayName": "On-Demand VPN",
        "PayloadIdentifier": uuidv4(),
        "PayloadType": "com.apple.vpn.on-demand",
        "PayloadUUID": uuidv4(),
        "PayloadVersion": 1,
        "VPNPayloadIdentifier": vpnDict["PayloadIdentifier"],
        "DomainAction": "Connect",
        "Domains": [cloudflareDomain]
      };

      // Add the on-demand VPN payload to the configuration profile
      configDict["PayloadContent"].push(onDemandVpnDict);
    }
  }

  // Create the proxy payload dictionary if proxy server and port are provided and proxy is enabled
  const proxyServer = formData.get('proxy_server') || '';
  const proxyPort = formData.get('proxy_port') || '';
  const proxyEnabled = formData.get('proxy-toggle') !== null;
  if (proxyEnabled && proxyServer && proxyPort) {
    const proxyDict = {
      "PayloadDisplayName": "Proxy",
      "PayloadIdentifier": uuidv4(),
      "PayloadType": "com.apple.proxy",
      "PayloadUUID": uuidv4(),
      "PayloadVersion": 1,
      "HTTPEnable": true,
      "HTTPPort": parseInt(proxyPort),
      "HTTPServer": proxyServer,
      "HTTPSEnable": true,
      "HTTPSPort": parseInt(proxyPort),
      "HTTPSServer": proxyServer
    };

    // Add the proxy payload to the configuration profile
    configDict["PayloadContent"].push(proxyDict);
  }

  // Create the DNS payload dictionary if DNS server is provided and DNS is enabled
  const dnsServer = formData.get('dns_server') || '';
  const dnsEnabled = formData.get('dns-toggle') !== null;
  if (dnsEnabled && dnsServer) {
    const dnsDict = {
      "PayloadDisplayName": "DNS",
      "PayloadIdentifier": uuidv4(),
      "PayloadType": "com.apple.dns",
      "PayloadUUID": uuidv4(),
      "PayloadVersion": 1,
      "Servers": [dnsServer]
    };

    // Add the DNS payload to the configuration profile
    configDict["PayloadContent"].push(dnsDict);
  }

  // Convert the configuration dictionary to a string
  const configProfile = JSON.stringify(configDict, null, 2);

  // Create a Blob object from the configuration profile string
  const configBlob = new Blob([configProfile], { type: 'application/x-apple-config' });

  // Create a download link and click it to download the file
  const downloadLink = document.createElement('a');
  downloadLink.href = URL.createObjectURL(configBlob);
  downloadLink.download = 'config.mobileconfig';
  downloadLink.click();

  // Wait for the download to complete before revoking the object URL
  setTimeout(() => {
    URL.revokeObjectURL(downloadLink.href);
  }, 1000);
});

// Generate a random UUID (universally unique identifier)
function uuidv4() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}
