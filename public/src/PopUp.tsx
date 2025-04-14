const showPopup = (message: string, colour: string = "#ffff77", putshadow: boolean = true, duration = 2000) => {
  const popup = document.createElement("div");
  popup.textContent = "" + message;

  let shadow = "0px 4px 6px rgba(0, 0, 0, 0.1)";
  if(putshadow === false) shadow = "0px 0px 0px rgba(0, 0, 0, 0)";

  Object.assign(popup.style, {
    position: "fixed",
    top: "10%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: colour,
    color: "black",
    padding: "15px 25px",
    borderRadius: "40px",
    boxShadow: shadow,
    transition: "opacity 0.5s ease-in-out",
    opacity: "1",
    zIndex: "1000",
  });

  document.body.appendChild(popup);

  setTimeout(() => {
    popup.style.opacity = "0";
    setTimeout(() => document.body.removeChild(popup), 500);
  }, duration);
};

export default showPopup;
