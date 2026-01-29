# Memory: features/companies/onboarding-creation-flow-v1
Updated: now

Új cég létrehozásánál egy dialógus jelenik meg két opcióval: "Bevezetéssel" vagy "Bevezetés nélkül". Ha a felhasználó a "Bevezetéssel" opciót választja, a cég Új érkező (isNewcomer) státusszal jön létre és megjelenik a Bevezetés panel. Ha "Bevezetés nélkül", akkor nincs Bevezetés panel.

CRM-ből érkező cégek (location.state.fromCrm === true) esetén a dialógus nem jelenik meg, automatikusan isNewcomer = true státusszal jönnek létre.
