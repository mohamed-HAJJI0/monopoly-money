import React, { useEffect, useRef, useState } from "react";
import NumberFormat, { NumberFormatValues } from "react-number-format";

interface IMonopolyAmountInputProps {
  amount: number | null;
  setAmount: (amount: number | null) => void;
  id?: string;
  autoFocus?: boolean;
}

const MonopolyAmountInput: React.FC<IMonopolyAmountInputProps> = ({
  amount,
  setAmount,
  id,
  autoFocus = false
}) => {
  const [inputValue, setInputValue] = useState("");
  const numberInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && numberInputRef.current !== null) {
      numberInputRef.current.focus();
    }
  }, [numberInputRef]);

  // When the external amount changes, update the internal
  useEffect(() => {
    setInputValue(amount === 0 || amount === null ? "" : `${amount}`);
  }, [amount]);

  // When the internal amount changes, update the external
  useEffect(() => {
    setAmount(inputValue === "" ? null : parseFloat(inputValue));
  }, [inputValue]);

  return (
    <NumberFormat
      allowNegative={false}
      thousandSeparator={true}
      prefix="$"
      id={id}
      value={inputValue}
      onValueChange={({ value }: NumberFormatValues) => setInputValue(value)}
      className="form-control text-center w-100"
      autoComplete="off"
      getInputRef={numberInputRef}
      inputMode="decimal"
    />
  );
};

export default MonopolyAmountInput;
