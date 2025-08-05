import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, Pencil, Trash2, Save, X } from 'lucide-react';
import { 
  getPrayerTopics, 
  createPrayerTopic, 
  updatePrayerTopic,
  PrayerTopic 
} from '@/services/adminService';
import { useToast } from '@/components/ui/use-toast';

export default function PrayerTopicsTab() {
  const [topics, setTopics] = useState<PrayerTopic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    is_active: boolean;
  }>({ title: '', description: '', is_active: true });
  
  const { toast } = useToast();

  useEffect(() => {
    loadPrayerTopics();
  }, []);

  const loadPrayerTopics = async () => {
    try {
      setIsLoading(true);
      const data = await getPrayerTopics();
      setTopics(data);
    } catch (error) {
      console.error('Error loading prayer topics:', error);
      toast({
        title: 'Error',
        description: 'Failed to load prayer topics',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setFormData({ title: '', description: '', is_active: true });
    setEditingId('new');
    setIsCreating(true);
  };

  const handleEdit = (topic: PrayerTopic) => {
    setFormData({
      title: topic.title,
      description: topic.description || '',
      is_active: topic.is_active
    });
    setEditingId(topic.id);
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsCreating(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingId === 'new') {
        await createPrayerTopic(formData);
        toast({
          title: 'Success',
          description: 'Prayer topic created successfully',
        });
      } else if (editingId) {
        await updatePrayerTopic(editingId, formData);
        toast({
          title: 'Success',
          description: 'Prayer topic updated successfully',
        });
      }
      
      await loadPrayerTopics();
      handleCancel();
    } catch (error) {
      console.error('Error saving prayer topic:', error);
      toast({
        title: 'Error',
        description: 'Failed to save prayer topic',
        variant: 'destructive',
      });
    }
  };

  const handleToggleActive = async (topic: PrayerTopic) => {
    try {
      await updatePrayerTopic(topic.id, { is_active: !topic.is_active });
      await loadPrayerTopics();
      toast({
        title: 'Success',
        description: `Prayer topic ${!topic.is_active ? 'activated' : 'deactivated'}`,
      });
    } catch (error) {
      console.error('Error toggling prayer topic status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update prayer topic status',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Prayer Topics</h2>
        <Button onClick={handleCreate} disabled={isCreating}>
          <Plus className="h-4 w-4 mr-2" />
          Add Topic
        </Button>
      </div>

      {(editingId === 'new' || editingId) && (
        <div className="bg-card p-4 rounded-lg border mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1"
                rows={3}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
            
            <div className="flex justify-end space-x-2 pt-2">
              <Button type="button" variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button type="submit">
                <Save className="h-4 w-4 mr-2" />
                {editingId === 'new' ? 'Create' : 'Save'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {topics.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No prayer topics found
            </div>
          ) : (
            <div className="space-y-2">
              {topics.map((topic) => (
                <div 
                  key={topic.id} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium">{topic.title}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        topic.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {topic.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    {topic.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {topic.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleToggleActive(topic)}
                    >
                      {topic.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEdit(topic)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
