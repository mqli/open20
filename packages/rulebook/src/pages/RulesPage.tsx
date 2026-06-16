import { useParams } from 'react-router-dom';

export default function RulesPage() {
  const { '*': subpath } = useParams();

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">Rules</h1>
      {subpath && <p className="text-muted-foreground mb-4">Current path: {subpath}</p>}
      <p className="text-muted-foreground">Rule content will be displayed here.</p>
    </div>
  );
}
