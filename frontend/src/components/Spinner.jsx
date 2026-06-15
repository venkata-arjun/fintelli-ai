const sizeMap = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-8 w-8 border-[3px]",
};

const Spinner = ({ size = "md" }) => {
  return (
    <div
      className={`${sizeMap[size]} animate-spin rounded-full border-gray-200 border-t-gray-900`}
    />
  );
};

export default Spinner;
