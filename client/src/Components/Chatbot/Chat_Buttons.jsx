

export default function ChatButtons({ buttons, onButtonClick }) {
  if (!buttons || buttons.length === 0) {
    return null;
  }

  return (
    <div className="button-container">
      {buttons.map((btn, index) => (
        <button
          key={index}
          className="choice-button"
          onClick={() => onButtonClick(btn.value)}
        >
          {btn.label}
        </button>
      ))}
    </div>
  );
};

