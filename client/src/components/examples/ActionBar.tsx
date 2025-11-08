import ActionBar from '../ActionBar';

export default function ActionBarExample() {
  return (
    <div className="p-8">
      <ActionBar
        onUndo={() => console.log('Undo')}
        onRedo={() => console.log('Redo')}
        onCopy={() => console.log('Copy')}
        canUndo={true}
        canRedo={false}
      />
    </div>
  );
}
