import React from "react";
import { motion } from "framer-motion";

const Button = ({ displayIcon, text, disabled, ...rest }) => {
  return (
    // <motion.button
    //   whileHover={{
    //     position: "relative",
    //     zIndex: 1,
    //     scale: 1.2,
    //     transition: {
    //       duration: 0.2,
    //     },
    //   }}
    // >
    <button
      type="submit"
      className="relative bg-button text-white py-2.5 px-5 w-60 text-center flex items-center justify-center 
      outline-none hover:bg-buttonHover rounded-xl hover:scale-105 transition-all ease-in-out duration-700 disabled:bg-buttonHover disabled:opacity-80"
      disabled={disabled}
      style={{ marginTop: "20px" }}
      {...rest}
    >
      <span>{text}</span>
      {displayIcon && (
        <img
          src="/arrow-forward.png"
          alt="arrow"
          className="absolute right-5"
        />
      )}
    </button>
    // </motion.button>
  );
};

export default Button;
