import StarterPrompts from '../StarterPrompts';

export default function StarterPromptsExample() {
  return (
    <div className="p-8">
      <StarterPrompts onSelect={(prompt) => console.log('Selected:', prompt)} />
    </div>
  );
}
