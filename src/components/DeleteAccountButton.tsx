import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { useAuth } from '../contexts/AuthContext';
import { Trash2 } from 'lucide-react';

interface DeleteAccountButtonProps {
  className?: string;
}

export const DeleteAccountButton: React.FC<DeleteAccountButtonProps> = ({ className = '' }) => {
  const { deleteAccount } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteStep, setDeleteStep] = useState<'initial' | 'confirming' | 'deleting'>('initial');
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  // Reset to initial state after 5 seconds if user doesn't confirm
  useEffect(() => {
    if (deleteStep === 'confirming') {
      const id = setTimeout(() => {
        setDeleteStep('initial');
      }, 5000);
      setTimeoutId(id);
    } else if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [deleteStep, timeoutId]);

  const handleDeleteClick = async () => {
    if (deleteStep === 'initial') {
      setDeleteStep('confirming');
    } else if (deleteStep === 'confirming') {
      setDeleteStep('deleting');
      setIsDeleting(true);
      
      try {
        const success = await deleteAccount();
        if (success) {
          // Account deleted successfully, user will be redirected automatically
          console.log('Account deleted successfully');
        } else {
          console.error('Failed to delete account');
          setDeleteStep('initial');
          setIsDeleting(false);
        }
      } catch (error) {
        console.error('Error deleting account:', error);
        setDeleteStep('initial');
        setIsDeleting(false);
      }
    }
  };

  const getButtonText = () => {
    switch (deleteStep) {
      case 'initial':
        return 'Usuń konto trwale';
      case 'confirming':
        return 'Czy jesteś pewien?';
      case 'deleting':
        return 'Usuwanie...';
      default:
        return 'Usuń konto trwale';
    }
  };

  const getButtonVariant = () => {
    return 'outline';
  };

  return (
    <Button
      onClick={handleDeleteClick}
      variant={getButtonVariant()}
      disabled={isDeleting}
      className={`${className} border-red-500 text-red-500`}
    >
      <Trash2 className="h-4 w-4 mr-2" />
      {getButtonText()}
    </Button>
  );
};
