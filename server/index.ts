import { Edith, EdithButton } from "../src/edith.js";

import "../src/css/edith.scss";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(Edith as any).EdithButton = EdithButton;

export default Edith;
