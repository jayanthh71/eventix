export type BookedSeat = {
  row: string;
  number: number;
};

type SeatGridProps = {
  rows?: number;
  cols?: number;
  bookedSeats: BookedSeat[];
  selectedSeats: string[];
  seatLimit: number;
  onSelect: (seatId: string) => void;
};
export default function SeatGrid({
  rows = 12,
  cols = 22,
  bookedSeats,
  selectedSeats,
  seatLimit,
  onSelect,
}: SeatGridProps) {
  const isBooked = (rowLabel: string, number: number) =>
    bookedSeats.some((seat) => seat.row === rowLabel && seat.number === number);

  const seatId = (rowLabel: string, number: number) => `${rowLabel}-${number}`;

  return (
    <div className="rounded-2xl border border-gray-700/50 bg-gradient-to-br from-gray-800/80 to-gray-900/80 p-6 backdrop-blur-sm">
      <h3 className="font-anek mb-6 text-xl font-bold text-white">
        Select Seats
      </h3>
      <div className="flex flex-col items-center gap-2">
        {Array.from({ length: rows }, (_, rowIdx) => {
          if (rowIdx === 6) {
            return (
              <div key={rowIdx} className="flex gap-2">
                {Array.from({ length: cols }, (_, colIdx) => (
                  <span
                    key={`gap-${rowIdx}-${colIdx}`}
                    className="inline-block h-10 w-10"
                  />
                ))}
              </div>
            );
          }
          const visibleRowIdx = rowIdx < 6 ? rowIdx : rowIdx - 1;
          const rowLabel = String.fromCharCode(65 + visibleRowIdx);
          let seatNumber = 1;
          return (
            <div key={rowIdx} className="flex gap-2">
              <span
                key={`row-label-${rowIdx}-1`}
                className="font-anek mx-4 flex h-10 w-10 items-center justify-center text-lg font-bold text-gray-400 select-none"
              >
                {rowLabel}
              </span>
              {Array.from({ length: cols - 2 }, (_, colIdx) => {
                const row = rowIdx + 1;
                const number = colIdx + 2;
                if ([7, 8, 15, 16].includes(number) && row !== 1) {
                  return (
                    <span
                      key={`empty-${rowLabel}-${number}`}
                      className="inline-block h-10 w-10"
                    />
                  );
                }
                const booked = isBooked(rowLabel, number);
                const id = seatId(rowLabel, number);
                const isSelected = selectedSeats.includes(id);
                const currentSeatNumber = seatNumber;
                seatNumber++;
                return (
                  <button
                    key={id}
                    disabled={booked}
                    onClick={() => onSelect(id)}
                    className={`font-anek flex h-10 w-10 items-center justify-center rounded-md border text-sm font-bold transition-all duration-200 ${
                      booked
                        ? "cursor-not-allowed border-gray-500 bg-gray-600 text-gray-300"
                        : isSelected
                          ? "cursor-pointer border-purple-400 bg-purple-500/80 text-white"
                          : `${selectedSeats.length >= seatLimit ? "cursor-not-allowed" : "cursor-pointer"} border-gray-600 bg-gray-800 text-white hover:border-purple-400 hover:bg-purple-700/40`
                    } `}
                    title={`Row ${rowLabel}, Seat ${currentSeatNumber}`}
                  >
                    {currentSeatNumber}
                  </button>
                );
              })}
              <span
                key={`row-label-${rowIdx}-22`}
                className="font-anek mx-4 flex h-10 w-10 items-center justify-center text-lg font-bold text-gray-400 select-none"
              >
                {rowLabel}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-10 mb-4 flex justify-center">
        <div className="flex h-6 w-2/3 max-w-xl items-center justify-center rounded-b-2xl border-x border-b border-gray-300 bg-gradient-to-t from-gray-400/80 to-gray-100/60 shadow-lg">
          <span className="font-anek text-xs font-semibold tracking-widest text-gray-700">
            SCREEN
          </span>
        </div>
      </div>

      <div className="font-anek mt-6 flex justify-center gap-6 text-xs font-medium text-gray-300">
        <div className="flex flex-col items-center gap-1">
          <span className="flex h-10 w-10 items-center justify-center rounded-md border border-purple-400 bg-purple-500/80 text-sm font-bold text-white">
            S
          </span>
          Selected
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="flex h-10 w-10 items-center justify-center rounded-md border border-gray-500 bg-gray-600 text-sm font-bold text-gray-300">
            B
          </span>
          Booked
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="flex h-10 w-10 items-center justify-center rounded-md border border-gray-600 bg-gray-800 text-sm font-bold text-white">
            A
          </span>
          Available
        </div>
      </div>
      <div className="font-anek mt-4 flex justify-center font-medium text-gray-300">
        {selectedSeats.length} / {seatLimit} seat
        {selectedSeats.length !== 1 ? "s" : ""} selected
      </div>
    </div>
  );
}
