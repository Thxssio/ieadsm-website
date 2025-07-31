export default function IconWrapper({ children }) {
  return (
    <div className="flex-shrink-0 w-16 h-16 bg-[#2a3d57]/10 text-[#2a3d57] rounded-full inline-flex items-center justify-center border-4 border-white shadow-sm">
      {children}
    </div>
  );
}
