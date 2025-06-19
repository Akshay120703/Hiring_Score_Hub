import { Button } from "@/components/ui/button";

interface RatingScaleProps {
  maxScore: number;
  value?: number;
  onChange: (score: number) => void;
}

export default function RatingScale({ maxScore, value, onChange }: RatingScaleProps) {
  return (
    <div className="flex items-center space-x-2">
      {Array.from({ length: maxScore }, (_, i) => i + 1).map((score) => (
        <Button
          key={score}
          type="button"
          variant="outline"
          className={`score-button ${
            value === score ? 'score-button-selected' : 'score-button-unselected'
          }`}
          onClick={() => onChange(score)}
        >
          {score}
        </Button>
      ))}
    </div>
  );
}
