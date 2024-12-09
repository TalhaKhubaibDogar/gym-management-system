/* eslint-disable react/no-unknown-property */
import { FaSpinner } from "react-icons/fa";
import style from "./loader.module.scss";

function Loader() {
  return <FaSpinner className={style.spinner} />;
}

export { Loader };
