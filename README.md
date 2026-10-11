# LYFE Pharmacy

React application powered by Vite.

## Run locally

Requirements: Node.js 20.19+ or 22.12+ and npm.

```powershell
npm.cmd install
npm.cmd run dev
```

Open <http://localhost:5173>. Stop the server with `Ctrl+C`.

In VS Code you can instead press `Ctrl+Shift+B` and choose **Start LYFE Pharmacy**.

## Collaborate with VS Code Live Share

### Host

1. Open this project folder in the desktop version of VS Code.
2. Install the **Live Share** extension (`ms-vsliveshare.vsliveshare`) and sign in.
3. Select **Live Share** in the status bar, or open the Command Palette with `Ctrl+Shift+P` and run **Live Share: Start collaboration session (Share)**. Do not choose a read-only session.
4. Send the copied invitation link to the participant.
5. Start the app with `npm.cmd run dev` in a PowerShell terminal, or press `Ctrl+Shift+B` and run **Start LYFE Pharmacy**.
6. In the Live Share panel, select **Share server**, enter port `5173`, and name it `LYFE Pharmacy`.
7. If the participant also needs to run commands, select **Share terminal** and choose **Read/write**. Only do this for someone you trust because it lets them run commands on the host computer.

### Participant

1. Install the **Live Share** extension in desktop VS Code and sign in.
2. Open the host's invitation link. Alternatively, run **Live Share: Join Collaboration Session** from the Command Palette and paste the link.
3. Confirm the status bar says **Joined** and not **Joined Read-only**. If it says read-only, ask the host to stop the session and start a normal editable session.
4. Edit a shared project file normally. The files remain on the host computer and changes are synchronized by Live Share.
5. In the Live Share panel, expand **Shared Servers** and select **LYFE Pharmacy (5173)**. Live Share opens the forwarded app in the participant's browser. The participant's forwarded port can differ if their port `5173` is already occupied; use the link shown in **Shared Servers**.

## Troubleshooting

- **Participant can view but cannot type:** the session is read-only. The host must stop it and start a normal **Share** session.
- **Participant cannot see files:** make sure the host opened the project folder itself before starting Live Share and that no `.vsls.json` rule excludes the file.
- **Participant cannot open the app:** the host must start Vite and explicitly share port `5173`; guests cannot share a host port.
- **PowerShell says `npm.ps1` cannot be loaded:** use `npm.cmd` as shown above. This avoids changing the computer's execution policy.
- **Port 5173 is already in use:** stop the process using that port, then run `npm.cmd run dev` again. This project intentionally uses a fixed port so everyone shares the same endpoint.
- **Connection or sign-in fails:** allow VS Code/Live Share through the firewall and make sure both people are signed in. Restart VS Code after installing Live Share.
- **Hot reload does not update:** refresh the participant's forwarded browser tab once, then save a source file again.

> Security: Share only the application port (`5173`). A read/write shared terminal gives a participant the same command access as the host account.
