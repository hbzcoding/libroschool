<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class GrantNotePermissionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $noteId = $this->route('note')?->id;

        return [
            'user_id' => [
                'required',
                'exists:users,id',
                Rule::unique('note_permissions')->where(function ($query) use ($noteId) {
                    return $query->where('note_id', $noteId);
                }),
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'user_id.unique' => 'This user already has access to this note.',
        ];
    }
}