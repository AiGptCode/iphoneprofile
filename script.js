// Generate a unique UUID for the configuration profile and its payloads
function uuidv4() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

// Determine the APN to use based on the form data
function getApn(formData) {
  const apn = formData.get('apn');
  if (apn === '') {
    // Automatically select APN based on carrier
    const carrier = formData.get('carrier');
    if (carrier === 'mcinet') {
      return 'mcinet';
    } else if (carrier === 'irancell') {
      return 'irancelmci';
    } else if (carrier === 'rightel') {
      return 'right';
    } else {
      return '';
    }
  } else {
    // Use selected APN
    return apn;
  }
}

// Generate the cellular payload for the configuration profile
function generateCellularPayload(formData) {
  const apn = getApn(formData);
  const carrier = apn === '' ? formData.get('carrier') : apn;
  return {
    PayloadDisplayName: "Cellular",
    PayloadIdentifier: uuidv4(),
    PayloadType: "com.apple.cellular",
    PayloadUUID: uuidv4(),
    PayloadVersion: 1,
    APNs: [{
      AuthenticationType: (carrier === 'mcinet') ? 'CHAP' : 'PAP',
      Enabled: true,
      Name: apn
    }],
    SignalBoostEnabled: true,
    APNSelectionMode: "Automatic"
  };
}

// Generate the VPN payload for the configuration profile, if VPN is enabled
function generateVpnPayload(formData) {
  if (!formData.get('vpn-toggle')) {
    return null;
  }
  const vpnServer = formData.get('vpn_server');
  if (vpnServer === '') {
    return null;
  }
  const vpnUsername = formData.get('vpn_username') || "YourUsername";
  const vpnPassword = formData.get('vpn_password') || "YourPassword";
  return {
    PayloadDisplayName: "VPN",
    PayloadIdentifier: uuidv4(),
    PayloadType: "com.apple.vpn.managed",
    PayloadUUID: uuidv4(),
    PayloadVersion: 1,
    AuthenticationMethod: "Certificate",
    DisconnectOnLogout: true,
    DisconnectOnSleep: true,
    SendAllTraffic: true,
    ServerAddress: vpnServer,
    ServerPort: 1723,
    Protocol: "L2TP",
    SharedSecret: "YourSharedSecret",
    Username: vpnUsername,
    Password: vpnPassword
  };
}

// Generate the on-demand VPN payload for the configuration profile, if Cloudflare is enabled
function generateOnDemandVpnPayload(formData, vpnPayload) {
  if (!formData.get('cloudflare-toggle')) {
    return null;
  }
  const cloudflareDomain = formData.get('cloudflare_domain');
  if (cloudflareDomain === '') {
    return null;
  }
  return {
    PayloadDisplayName: "On-Demand VPN",
    PayloadIdentifier: uuidv4(),
    PayloadType: "com.apple.vpn.on-demand",
    PayloadUUID: uuidv4(),
    PayloadVersion: 1,
    VPNPayloadIdentifier: vpnPayload.PayloadIdentifier,
    DomainAction: "Connect",
    Domains: [cloudflareDomain]
  };
}

// Generate the proxy payload for the configuration profile, if proxy is enabled
function generateProxyPayload(formData) {
  if (!formData.get('proxy-toggle')) {
    return null;
  }
  const proxyServer = formData.get('proxy_server');
  if (proxyServer === '') {
    return null;
  }
  const proxyPort = parseInt(formData.get('proxy_port')) ||
