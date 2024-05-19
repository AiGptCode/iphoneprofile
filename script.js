const configForm = document.getElementById('config-form');

configForm.addEventListener('submit', (event) => {
  event.preventDefault();

  // Collect form data
  const formData = new FormData(configForm);
  const configProfile = generateConfigProfile(formData);

  // Create a download link and click it to download the file
  const downloadLink = document.createElement('a');
  downloadLink.href = URL.createObjectURL(new Blob([configProfile], { type: 'text/plain' }));
  downloadLink.download = 'config.cfg';
  downloadLink.click();
});

function generateConfigProfile(formData) {
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

  // Create the VPN payload dictionary if VPN server is provided
  const vpnServer = formData.get('vpn_server') || '';
  if (vpnServer) {
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
  }

  // Create the proxy payload dictionary if proxy server and port are provided
  const proxyServer = formData.get('proxy_server') || '';
  const proxyPort = formData.get('proxy_port') || '';
  if (proxyServer && proxyPort) {
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

  // Create the DNS payload dictionary if DNS server is provided
  const dnsServer = formData.get('dns_server') || '';
  if (dnsServer) {
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

  // Create the Cloudflare payload dictionary if Cloudflare domain is provided
  const cloudflareDomain = formData.get('cloudflare_domain') || '';
  if (cloudflareDomain) {
    const cloudflareDict = {
      "PayloadDisplayName": "Cloudflare",
      "PayloadIdentifier": uuidv4(),
      "PayloadType": "com.apple.dns",
      "PayloadUUID": uuidv4(),
      "PayloadVersion": 1,
      "Domains": [cloudflareDomain],
      "ServerAddresses": ["1.1.1.1", "1.0.0.1"]
    };

    // Add the Cloudflare payload to the configuration profile
    configDict["PayloadContent"].push(cloudflareDict);
  }

  // Convert the configuration dictionary to a string
  const configProfile = JSON.stringify(configDict, null, 2);

  return configProfile;
}

// Generate a random UUID (universally unique identifier)
function uuidv4() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}
