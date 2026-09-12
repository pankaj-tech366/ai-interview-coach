export default function EvilEyes() {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-14 z-[1] flex justify-center sm:bottom-20"
      aria-hidden="true"
    >
      <div className="flex gap-5">
        <span className="evil-eye" />
        <span className="evil-eye" />
      </div>
    </div>
  );
}
