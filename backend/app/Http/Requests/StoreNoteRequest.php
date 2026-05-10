<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreNoteRequest extends FormRequest
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
        return [
            'title' => ['required', 'string', 'max:255'],
            'content' => ['nullable', 'string', 'max:65535'],
            'school_id' => ['nullable', 'exists:schools,id'],
            'classroom_id' => [
                'nullable',
                'exists:classrooms,id',
                Rule::requiredIf(fn () => $this->input('visibility') === 'classroom'),
            ],
            'subject' => ['nullable', 'string', 'max:100'],
            'grade' => ['nullable', 'integer', 'min:1', 'max:5'],
            'visibility' => ['required', 'string', 'in:public,private,classroom,specific_users'],
            'mode' => ['required', 'string', 'in:normal,flashcard'],
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
            'classroom_id.required_if' => 'A classroom is required when visibility is set to classroom.',
        ];
    }
}