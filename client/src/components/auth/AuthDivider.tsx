export default function AuthDivider() {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center" aria-hidden>
        <div className="w-full border-t border-border-muted" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-surface px-3 text-caption text-navy-400">or continue with email</span>
      </div>
    </div>
  );
}
