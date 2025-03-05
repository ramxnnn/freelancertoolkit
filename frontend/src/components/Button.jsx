const Button = ({ children, variant = "primary", onClick, className = "" }) => {
    const baseStyles = "px-4 py-2 rounded font-medium transition-all";
    const variants = {
      primary: "bg-blue-500 text-white hover:bg-blue-600",
      secondary: "bg-gray-200 text-gray-700 hover:bg-gray-300",
    };
    return (
      <button className={`${baseStyles} ${variants[variant]} ${className}`} onClick={onClick}>
        {children}
      </button>
    );
  };
  
  export default Button;